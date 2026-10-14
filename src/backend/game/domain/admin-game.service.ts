import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export class AdminGameError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export type AdminGameInput = {
  name: string;
  slug: string;
  serviceSummary?: string | null;
  artworkKey?: string | null;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
};

const serializeGame = (game: {
  _id: unknown;
  name: string;
  slug: string;
  service_summary: string | null;
  artwork_key: string | null;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  updated_at: Date;
  services?: Array<{ is_active: boolean; deleted_at: Date | null }>;
}) => ({
  id: String(game._id),
  name: game.name,
  slug: game.slug,
  serviceSummary: game.service_summary,
  artworkKey: game.artwork_key,
  serviceCount: game.services?.filter((service) => service.is_active && !service.deleted_at).length ?? 0,
  active: game.is_active,
  popular: game.is_popular,
  sortOrder: game.sort_order,
  updatedAt: game.updated_at.toISOString(),
});

async function recordAudit(
  request: Request,
  action: 'GAME_CREATED' | 'GAME_UPDATED' | 'GAME_DELETED',
  gameId: string,
  changedFields: Record<string, unknown>
) {
  try {
    const token = getAdminToken(request);
    const claims = token ? await verifyAdminAccessToken(token) : null;
    const actor = claims ? await db.orm.admin_account.where({ _id: claims.sub }).first() : null;
    await db.orm.activity_log.create({
      _id: new ObjectId().toHexString(),
      actor_admin_id: actor ? String(actor._id) : null,
      actor_name_snapshot: actor?.name ?? null,
      actor_email_snapshot: actor?.email ?? null,
      action_code: action,
      action_label:
        action === 'GAME_CREATED' ? 'Membuat game' : action === 'GAME_UPDATED' ? 'Memperbarui game' : 'Menghapus game',
      category: 'CATALOG',
      target_type: 'GAME',
      target_id: gameId,
      target_reference: gameId,
      result: 'SUCCESS',
      failure_code: null,
      reason: null,
      changed_fields: JSON.parse(JSON.stringify(changedFields)),
      request_id: request.headers.get('x-request-id'),
      source_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: request.headers.get('user-agent'),
      occurred_at: new Date(),
    });
  } catch {
    // Catalog writes remain successful if the optional audit sink is unavailable.
  }
}

export async function listAdminGames() {
  const games = await db.orm.game_catalog.include('services').orderBy({ sort_order: 1 }).all();
  return games.filter((game) => !game.deleted_at).map(serializeGame);
}

export async function getAdminGame(gameId: string) {
  if (!ObjectId.isValid(gameId)) throw new AdminGameError('GAMB02001', 'ID game tidak valid.', 400);
  const game = await db.orm.game_catalog.where({ _id: gameId }).include('services').first();
  if (!game || game.deleted_at) throw new AdminGameError('GAMB02004', 'Game tidak ditemukan.', 404);
  return serializeGame(game);
}

function ensureUnique(
  name: string,
  slug: string,
  excludingId?: string,
  all?: Array<{ _id: unknown; name: string; slug: string }>
) {
  const nameKey = name.trim().toLocaleLowerCase('id-ID');
  const duplicate = all?.find(
    (game) =>
      String(game._id) !== excludingId &&
      (game.name.trim().toLocaleLowerCase('id-ID') === nameKey || game.slug === slug)
  );
  if (duplicate) throw new AdminGameError('GAMB02002', 'Nama atau slug game sudah digunakan.', 409);
}

export async function createAdminGame(input: AdminGameInput, request: Request) {
  const games = await db.orm.game_catalog.all();
  ensureUnique(input.name, input.slug, undefined, games);
  const isActive = input.isActive ?? false;
  const isPopular = input.isPopular ?? false;
  if (isPopular && !isActive) throw new AdminGameError('GAMB02003', 'Game nonaktif tidak dapat ditandai populer.', 400);
  const sortOrder = input.sortOrder ?? 0;
  const now = new Date();
  const id = new ObjectId().toHexString();
  await db.orm.game_catalog.create({
    _id: id,
    name: input.name.trim(),
    slug: input.slug,
    service_summary: input.serviceSummary?.trim() || null,
    artwork_key: input.artworkKey?.trim() || null,
    is_active: isActive,
    is_popular: isPopular,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  await recordAudit(request, 'GAME_CREATED', id, { name: input.name.trim(), slug: input.slug });
  return getAdminGame(id);
}

export async function updateAdminGame(gameId: string, input: Partial<AdminGameInput>, request: Request) {
  if (!ObjectId.isValid(gameId)) throw new AdminGameError('GAMB02001', 'ID game tidak valid.', 400);
  const game = await db.orm.game_catalog.where({ _id: gameId }).first();
  if (!game || game.deleted_at) throw new AdminGameError('GAMB02004', 'Game tidak ditemukan.', 404);
  const name = input.name?.trim() ?? game.name;
  const slug = input.slug ?? game.slug;
  ensureUnique(name, slug, gameId, await db.orm.game_catalog.all());
  const isActive = input.isActive ?? game.is_active;
  const isPopular = input.isPopular ?? game.is_popular;
  if (!isActive && isPopular) throw new AdminGameError('GAMB02003', 'Game nonaktif tidak dapat ditandai populer.', 400);
  const patch = {
    ...(input.name !== undefined ? { name } : {}),
    ...(input.slug !== undefined ? { slug } : {}),
    ...(input.serviceSummary !== undefined ? { service_summary: input.serviceSummary?.trim() || null } : {}),
    ...(input.artworkKey !== undefined ? { artwork_key: input.artworkKey?.trim() || null } : {}),
    ...(input.isActive !== undefined
      ? { is_active: input.isActive, ...(input.isActive ? {} : { is_popular: false }) }
      : {}),
    ...(input.isPopular !== undefined ? { is_popular: input.isPopular } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    updated_at: new Date(),
  };
  await db.orm.game_catalog.where({ _id: gameId }).update(patch);
  await recordAudit(request, 'GAME_UPDATED', gameId, patch as Record<string, unknown>);
  return getAdminGame(gameId);
}

export async function deleteAdminGame(gameId: string, request: Request) {
  if (!ObjectId.isValid(gameId)) throw new AdminGameError('GAMB02001', 'ID game tidak valid.', 400);
  const game = await db.orm.game_catalog.where({ _id: gameId }).first();
  if (!game || game.deleted_at) throw new AdminGameError('GAMB02004', 'Game tidak ditemukan.', 404);
  const deletedAt = new Date();
  await db.orm.game_catalog
    .where({ _id: gameId })
    .update({ deleted_at: deletedAt, is_active: false, is_popular: false, updated_at: deletedAt });
  await recordAudit(request, 'GAME_DELETED', gameId, { deleted_at: deletedAt.toISOString() });
  return { id: gameId, deletedAt: deletedAt.toISOString() };
}

export function toAdminGameError(error: unknown) {
  if (error instanceof AdminGameError) return error;
  return new AdminGameError('GAMT03001', 'Layanan katalog game sedang tidak tersedia.', 500);
}
