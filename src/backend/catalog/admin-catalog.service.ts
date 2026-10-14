import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export class AdminCatalogError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly data: unknown = null
  ) {
    super(message);
  }
}

export type CategoryInput = { name: string; slug: string; description?: string | null; isActive?: boolean };
export type ServiceInput = {
  gameId: string;
  categoryId: string;
  name: string;
  priceAmount: number | null;
  isCustomPrice: boolean;
  estimateText: string;
  isActive?: boolean;
};

async function audit(
  request: Request,
  action: string,
  targetType: string,
  targetId: string,
  fields: Record<string, unknown>
) {
  try {
    const token = getAdminToken(request);
    const claims = token ? verifyAdminAccessToken(token) : null;
    const actor = claims ? await db.orm.admin_account.where({ _id: claims.sub }).first() : null;
    await db.orm.activity_log.create({
      _id: new ObjectId().toHexString(),
      actor_admin_id: actor ? String(actor._id) : null,
      actor_name_snapshot: actor?.name ?? null,
      actor_email_snapshot: actor?.email ?? null,
      action_code: action,
      action_label: action.replaceAll('_', ' ').toLowerCase(),
      category: 'CATALOG',
      target_type: targetType,
      target_id: targetId,
      target_reference: targetId,
      result: 'SUCCESS',
      failure_code: null,
      reason: null,
      changed_fields: JSON.parse(JSON.stringify(fields)),
      request_id: request.headers.get('x-request-id'),
      source_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: request.headers.get('user-agent'),
      occurred_at: new Date(),
    });
  } catch {
    /* Audit availability must not fail catalog writes. */
  }
}

type CategoryRow = Awaited<ReturnType<typeof db.orm.service_category.all>>[number];
type ServiceRow = {
  _id: unknown;
  game_id: unknown;
  category_id: unknown;
  name: string;
  price_amount: string | null;
  is_custom_price: boolean;
  estimate_text: string;
  is_active: boolean;
  updated_at: Date;
  game?: { name: string };
  category?: { name: string };
};

const categoryDto = (row: CategoryRow, serviceCount = 0) => ({
  id: String(row._id),
  name: row.name,
  slug: row.slug,
  description: row.description ?? '',
  serviceCount,
  active: row.is_active,
  updatedAt: row.updated_at.toISOString(),
});

export async function listAdminCategories() {
  const [rows, services] = await Promise.all([db.orm.service_category.all(), db.orm.game_service.all()]);
  return rows
    .filter((row) => !row.deleted_at)
    .map((row) =>
      categoryDto(row, services.filter((s) => String(s.category_id) === String(row._id) && !s.deleted_at).length)
    );
}

export async function getAdminCategory(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SCAB02001', 'ID kategori tidak valid.', 400);
  const row = await db.orm.service_category.where({ _id: id }).first();
  if (!row || row.deleted_at) throw new AdminCatalogError('SCAB02002', 'Kategori tidak ditemukan.', 404);
  const linked = await db.orm.game_service.all();
  return categoryDto(row, linked.filter((s) => String(s.category_id) === id && !s.deleted_at).length);
}

async function ensureCategoryUnique(input: CategoryInput, excludingId?: string) {
  const rows = await db.orm.service_category.all();
  if (
    rows.some(
      (row) =>
        String(row._id) !== excludingId &&
        !row.deleted_at &&
        (row.name.toLowerCase() === input.name.toLowerCase() || row.slug === input.slug)
    )
  )
    throw new AdminCatalogError('SCAB02004', 'Nama atau slug kategori sudah digunakan.', 409);
}

export async function createAdminCategory(input: CategoryInput, request: Request) {
  await ensureCategoryUnique(input);
  const now = new Date();
  const id = new ObjectId().toHexString();
  await db.orm.service_category.create({
    _id: id,
    name: input.name.trim(),
    slug: input.slug,
    description: input.description?.trim() || null,
    is_active: input.isActive ?? true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  await audit(request, 'SERVICE_CATEGORY_CREATED', 'SERVICE_CATEGORY', id, input);
  return getAdminCategory(id);
}

export async function updateAdminCategory(id: string, input: Partial<CategoryInput>, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SCAB02001', 'ID kategori tidak valid.', 400);
  const current = await db.orm.service_category.where({ _id: id }).first();
  if (!current || current.deleted_at) throw new AdminCatalogError('SCAB02002', 'Kategori tidak ditemukan.', 404);
  await ensureCategoryUnique({ name: input.name ?? current.name, slug: input.slug ?? current.slug }, id);
  const patch = {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
    updated_at: new Date(),
  };
  await db.orm.service_category.where({ _id: id }).update(patch);
  await audit(request, 'SERVICE_CATEGORY_UPDATED', 'SERVICE_CATEGORY', id, patch);
  return getAdminCategory(id);
}

export async function deleteAdminCategory(id: string, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SCAB02001', 'ID kategori tidak valid.', 400);
  const row = await db.orm.service_category.where({ _id: id }).first();
  if (!row || row.deleted_at) throw new AdminCatalogError('SCAB02002', 'Kategori tidak ditemukan.', 404);
  const linked = (await db.orm.game_service.all()).filter((s) => String(s.category_id) === id);
  if (linked.length)
    throw new AdminCatalogError('SCAB02003', 'Kategori masih digunakan layanan.', 409, {
      linkedServiceCount: linked.length,
    });
  const now = new Date();
  await db.orm.service_category.where({ _id: id }).update({ deleted_at: now, is_active: false, updated_at: now });
  await audit(request, 'SERVICE_CATEGORY_DELETED', 'SERVICE_CATEGORY', id, { deleted_at: now.toISOString() });
  return { categoryId: id, deletedAt: now.toISOString() };
}

const serviceDto = (row: ServiceRow) => ({
  id: String(row._id),
  gameId: String(row.game_id),
  game: row.game?.name ?? '',
  categoryId: String(row.category_id),
  category: row.category?.name ?? '',
  name: row.name,
  price: row.is_custom_price ? null : Number(row.price_amount?.toString() ?? 0),
  estimate: row.estimate_text,
  active: row.is_active,
  updatedAt: row.updated_at.toISOString(),
});

export async function listAdminServices() {
  const [rows, games, categories] = await Promise.all([
    db.orm.game_service.include('game').include('category').all(),
    db.orm.game_catalog.all(),
    db.orm.service_category.all(),
  ]);
  return {
    services: rows.filter((row) => !row.deleted_at).map(serviceDto),
    games: games.filter((row) => !row.deleted_at).map((row) => ({ id: String(row._id), name: row.name })),
    categories: categories.filter((row) => !row.deleted_at).map((row) => ({ id: String(row._id), name: row.name })),
  };
}

export async function getAdminService(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SRVB02001', 'ID layanan tidak valid.', 400);
  const row = await db.orm.game_service.where({ _id: id }).include('game').include('category').first();
  if (!row || row.deleted_at) throw new AdminCatalogError('SRVB02003', 'Layanan tidak ditemukan.', 404);
  return serviceDto(row);
}

async function checkServiceRefs(input: ServiceInput) {
  if (!ObjectId.isValid(input.gameId) || !ObjectId.isValid(input.categoryId))
    throw new AdminCatalogError('SRVB02001', 'Referensi game atau kategori tidak valid.', 400);
  const [game, category] = await Promise.all([
    db.orm.game_catalog.where({ _id: input.gameId }).first(),
    db.orm.service_category.where({ _id: input.categoryId }).first(),
  ]);
  if (
    !game ||
    game.deleted_at ||
    !category ||
    category.deleted_at ||
    ((input.isActive ?? true) && (!game.is_active || !category.is_active))
  )
    throw new AdminCatalogError('SRVB02002', 'Game atau kategori tidak tersedia untuk layanan ini.', 400);
}

export async function createAdminService(input: ServiceInput, request: Request) {
  await checkServiceRefs(input);
  const now = new Date();
  const id = new ObjectId().toHexString();
  await db.orm.game_service.create({
    _id: id,
    game_id: input.gameId,
    category_id: input.categoryId,
    name: input.name.trim(),
    price_amount: input.isCustomPrice ? null : String(input.priceAmount),
    is_custom_price: input.isCustomPrice,
    estimate_text: input.estimateText.trim(),
    is_active: input.isActive ?? true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  await audit(request, 'SERVICE_CREATED', 'SERVICE', id, input);
  return getAdminService(id);
}

export async function updateAdminService(id: string, input: Partial<ServiceInput>, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SRVB02001', 'ID layanan tidak valid.', 400);
  const current = await db.orm.game_service.where({ _id: id }).first();
  if (!current || current.deleted_at) throw new AdminCatalogError('SRVB02003', 'Layanan tidak ditemukan.', 404);
  const merged: ServiceInput = {
    gameId: input.gameId ?? String(current.game_id),
    categoryId: input.categoryId ?? String(current.category_id),
    name: input.name ?? current.name,
    priceAmount:
      input.priceAmount === undefined
        ? current.is_custom_price
          ? null
          : Number(current.price_amount?.toString() ?? 0)
        : input.priceAmount,
    isCustomPrice: input.isCustomPrice ?? current.is_custom_price,
    estimateText: input.estimateText ?? current.estimate_text,
    isActive: input.isActive ?? current.is_active,
  };
  await checkServiceRefs(merged);
  const patch = {
    game_id: merged.gameId,
    category_id: merged.categoryId,
    name: merged.name.trim(),
    price_amount: merged.isCustomPrice ? null : String(merged.priceAmount),
    is_custom_price: merged.isCustomPrice,
    estimate_text: merged.estimateText.trim(),
    is_active: merged.isActive ?? true,
    updated_at: new Date(),
  };
  await db.orm.game_service.where({ _id: id }).update(patch);
  await audit(request, 'SERVICE_UPDATED', 'SERVICE', id, patch);
  return getAdminService(id);
}

export async function deleteAdminService(id: string, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminCatalogError('SRVB02001', 'ID layanan tidak valid.', 400);
  const row = await db.orm.game_service.where({ _id: id }).first();
  if (!row || row.deleted_at) throw new AdminCatalogError('SRVB02003', 'Layanan tidak ditemukan.', 404);
  const now = new Date();
  await db.orm.game_service.where({ _id: id }).update({ deleted_at: now, is_active: false, updated_at: now });
  await audit(request, 'SERVICE_DELETED', 'SERVICE', id, { deleted_at: now.toISOString() });
  return { serviceId: id, deletedAt: now.toISOString() };
}

export function toAdminCatalogError(error: unknown, prefix: 'SC' | 'SRV') {
  if (error instanceof AdminCatalogError) return error;
  return new AdminCatalogError(`${prefix}T03001`, 'Data katalog sementara tidak tersedia.', 500);
}
