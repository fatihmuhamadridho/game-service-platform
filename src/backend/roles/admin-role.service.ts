import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export type PermissionKey = 'dashboard' | 'orders' | 'catalog' | 'users' | 'content' | 'finance' | 'settings';
export type RoleInput = {
  name: string;
  code: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  permissions?: string[];
};
export class AdminRoleError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}
const permissionDefinitions: Record<PermissionKey, { code: string; name: string }> = {
  dashboard: { code: 'dashboard-read', name: 'Dashboard' },
  orders: { code: 'orders-manage', name: 'Pesanan' },
  catalog: { code: 'catalog-manage', name: 'Produk & Layanan' },
  users: { code: 'users-manage', name: 'Pengguna' },
  content: { code: 'content-manage', name: 'Konten' },
  finance: { code: 'finance-read', name: 'Keuangan' },
  settings: { code: 'settings-manage', name: 'Pengaturan' },
};

async function audit(request: Request, action: string, roleId: string, fields: Record<string, unknown>) {
  try {
    const token = getAdminToken(request);
    const claims = token ? verifyAdminAccessToken(token) : null;
    const actor = claims ? await db.orm.admin_account.where({ _id: claims.sub }).first() : null;
    const now = new Date();
    await db.orm.activity_log.create({
      _id: new ObjectId().toHexString(),
      actor_admin_id: actor ? String(actor._id) : null,
      actor_name_snapshot: actor?.name ?? null,
      actor_email_snapshot: actor?.email ?? null,
      action_code: action,
      action_label: action.replaceAll('_', ' ').toLowerCase(),
      category: 'SETTINGS',
      target_type: 'ADMIN_ROLE',
      target_id: roleId,
      target_reference: roleId,
      result: 'SUCCESS',
      failure_code: null,
      reason: null,
      changed_fields: JSON.parse(JSON.stringify(fields)),
      request_id: request.headers.get('x-request-id'),
      source_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: request.headers.get('user-agent'),
      occurred_at: now,
    });
  } catch {
    /* Audit failure cannot make a committed role change appear failed. */
  }
}

async function mapRole(
  role: {
    _id: unknown;
    name: string;
    code: string;
    status: string;
    description: string | null;
    is_system: boolean;
    deleted_at: Date | null;
  },
  rolePermissions: Array<{ role_id: unknown; permission_id: unknown }>,
  permissions: Array<{ _id: unknown; code: string }>,
  accounts: Array<{ role_id: unknown; revoked_at: Date | null }>
) {
  const permissionIds = new Set(
    rolePermissions.filter((row) => String(row.role_id) === String(role._id)).map((row) => String(row.permission_id))
  );
  const codes = new Set(permissions.filter((row) => permissionIds.has(String(row._id))).map((row) => row.code));
  const keys = (Object.entries(permissionDefinitions) as Array<[PermissionKey, { code: string; name: string }]>)
    .filter(([, definition]) => codes.has(definition.code))
    .map(([key]) => key);
  return {
    id: String(role._id),
    name: role.name,
    code: role.code,
    status: role.status,
    description: role.description ?? '',
    adminCount: accounts.filter((row) => String(row.role_id) === String(role._id) && !row.revoked_at).length,
    permissions: keys,
    protected: role.is_system,
  };
}

export async function listAdminPermissions() {
  const records = await Promise.all((Object.keys(permissionDefinitions) as PermissionKey[]).map(ensurePermission));
  return records.map((permission) => ({
    id: String(permission._id),
    code: permission.code,
    name: permission.name,
    key: (Object.entries(permissionDefinitions) as Array<[PermissionKey, { code: string; name: string }]>).find(
      ([, item]) => item.code === permission.code
    )?.[0],
  }));
}

export async function listAdminRoles() {
  const [roles, links, permissions, accounts, permissionCatalog] = await Promise.all([
    db.orm.admin_role.all(),
    db.orm.role_permission.all(),
    db.orm.permission.all(),
    db.orm.account_role.all(),
    listAdminPermissions(),
  ]);
  const roleList = await Promise.all(
    roles.filter((role) => !role.deleted_at).map((role) => mapRole(role, links, permissions, accounts))
  );
  return { roles: roleList, permissionCatalog };
}

export async function getAdminRole(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminRoleError('ROLB02001', 'ID role tidak valid.', 400);
  const role = await db.orm.admin_role.where({ _id: id }).first();
  if (!role || role.deleted_at) throw new AdminRoleError('ROLB02002', 'Role tidak ditemukan.', 404);
  const [links, permissions, accounts] = await Promise.all([
    db.orm.role_permission.all(),
    db.orm.permission.all(),
    db.orm.account_role.all(),
  ]);
  return mapRole(role, links, permissions, accounts);
}

async function ensurePermission(key: PermissionKey) {
  const definition = permissionDefinitions[key];
  let permission = await db.orm.permission.where({ code: definition.code }).first();
  if (!permission)
    permission = await db.orm.permission.create({
      _id: new ObjectId().toHexString(),
      code: definition.code,
      name: definition.name,
      description: `Izin ${definition.name.toLowerCase()} pada dashboard.`,
      is_sensitive: key === 'settings' || key === 'users',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  return permission;
}

async function replacePermissions(roleId: string, permissionIds: string[], actorId: string | null) {
  const permissions = await db.orm.permission.all();
  const selected = permissions.filter(
    (permission) => permissionIds.includes(String(permission._id)) && permission.is_active
  );
  if (selected.length !== permissionIds.length)
    throw new AdminRoleError('ROLB02003', 'Satu atau lebih permission tidak tersedia.', 400);
  const old = await db.orm.role_permission.where({ role_id: roleId }).all();
  for (const row of old) await db.orm.role_permission.where({ _id: row._id }).delete();
  for (const permission of selected) {
    const now = new Date();
    await db.orm.role_permission.create({
      _id: new ObjectId().toHexString(),
      role_id: roleId,
      permission_id: String(permission._id),
      granted_by: actorId,
      created_at: now,
    });
  }
}

async function validateUnique(name: string, code: string, excludingId?: string) {
  const roles = await db.orm.admin_role.all();
  if (
    roles.some(
      (role) =>
        String(role._id) !== excludingId &&
        !role.deleted_at &&
        (role.name.trim().toLowerCase() === name.trim().toLowerCase() || role.code.toLowerCase() === code.toLowerCase())
    )
  )
    throw new AdminRoleError('ROLB02003', 'Nama atau kode role sudah digunakan.', 409);
}

export async function createAdminRole(input: RoleInput, request: Request) {
  await validateUnique(input.name, input.code);
  const id = new ObjectId().toHexString();
  const now = new Date();
  await db.orm.admin_role.create({
    _id: id,
    name: input.name.trim(),
    code: input.code,
    description: input.description?.trim() || null,
    status: input.status ?? 'ACTIVE',
    is_system: false,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  const claims = getAdminToken(request);
  const actorId = claims ? (verifyAdminAccessToken(claims)?.sub ?? null) : null;
  await replacePermissions(id, input.permissions ?? [], actorId);
  await audit(request, 'ADMIN_ROLE_CREATED', id, input as unknown as Record<string, unknown>);
  return getAdminRole(id);
}

export async function updateAdminRole(id: string, input: Partial<RoleInput>, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminRoleError('ROLB02001', 'ID role tidak valid.', 400);
  const role = await db.orm.admin_role.where({ _id: id }).first();
  if (!role || role.deleted_at) throw new AdminRoleError('ROLB02002', 'Role tidak ditemukan.', 404);
  if (role.is_system) throw new AdminRoleError('ROLB02004', 'Role system tidak dapat diubah.', 409);
  const code = input.code ?? role.code;
  const name = input.name ?? role.name;
  if (input.name !== undefined || input.code !== undefined) await validateUnique(name, code, id);
  const patch = {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.code !== undefined ? { code: input.code } : {}),
    ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    updated_at: new Date(),
  };
  await db.orm.admin_role.where({ _id: id }).update(patch);
  if (input.permissions !== undefined) {
    const token = getAdminToken(request);
    const actorId = token ? (verifyAdminAccessToken(token)?.sub ?? null) : null;
    await replacePermissions(id, input.permissions, actorId);
  }
  await audit(request, 'ADMIN_ROLE_UPDATED', id, {
    ...patch,
    ...(input.permissions ? { permissions: input.permissions } : {}),
  });
  return getAdminRole(id);
}

export async function deleteAdminRole(id: string, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminRoleError('ROLB02001', 'ID role tidak valid.', 400);
  const role = await db.orm.admin_role.where({ _id: id }).first();
  if (!role || role.deleted_at) throw new AdminRoleError('ROLB02002', 'Role tidak ditemukan.', 404);
  if (role.is_system) throw new AdminRoleError('ROLB02004', 'Role system tidak dapat dihapus.', 409);
  const accounts = (await db.orm.account_role.all()).filter((row) => String(row.role_id) === id && !row.revoked_at);
  if (accounts.length) throw new AdminRoleError('ROLB02005', 'Role masih digunakan akun admin.', 409);
  const now = new Date();
  await db.orm.admin_role.where({ _id: id }).update({ deleted_at: now, status: 'INACTIVE', updated_at: now });
  await audit(request, 'ADMIN_ROLE_DELETED', id, { deleted_at: now.toISOString() });
  return { id, deletedAt: now.toISOString() };
}

export function parseRoleInput(value: unknown, partial = false): RoleInput | Partial<RoleInput> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = ['name', 'code', 'description', 'status', 'permissions'];
  if (
    Object.keys(body).some((key) => !keys.includes(key)) ||
    (!partial && (!('name' in body) || !('code' in body))) ||
    (partial && !Object.keys(body).length)
  )
    return null;
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100))
    return null;
  if (body.code !== undefined && (typeof body.code !== 'string' || !/^[A-Z][A-Z0-9_]{0,49}$/.test(body.code)))
    return null;
  if (
    body.description !== undefined &&
    body.description !== null &&
    (typeof body.description !== 'string' || body.description.length > 500)
  )
    return null;
  if (body.status !== undefined && !['ACTIVE', 'INACTIVE'].includes(String(body.status))) return null;
  if (
    body.permissions !== undefined &&
    (!Array.isArray(body.permissions) ||
      body.permissions.some((id) => typeof id !== 'string' || !ObjectId.isValid(id)) ||
      new Set(body.permissions).size !== body.permissions.length)
  )
    return null;
  return body as RoleInput | Partial<RoleInput>;
}

export function toAdminRoleError(error: unknown) {
  if (error instanceof AdminRoleError) return error;
  return new AdminRoleError('ROLT03001', 'Data role sementara tidak tersedia.', 500);
}
