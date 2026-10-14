import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export class AdminAccountError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const activeRoleLinks = (
  links: Array<{ admin_account_id: unknown; role_id: unknown; revoked_at: Date | null }>,
  accountId: string
) => links.filter((link) => String(link.admin_account_id) === accountId && !link.revoked_at);

export async function listAdminAccounts(params: {
  search: string;
  status: string;
  roleId: string;
  page: number;
  pageSize: number;
}) {
  const [accounts, links, roles] = await Promise.all([
    db.orm.admin_account.all(),
    db.orm.account_role.all(),
    db.orm.admin_role.all(),
  ]);
  const search = params.search.toLocaleLowerCase('id-ID');
  const list = accounts
    .filter(
      (account) =>
        !account.deleted_at &&
        (!params.status || account.status === params.status) &&
        (!search || `${account.name} ${account.username} ${account.email}`.toLocaleLowerCase('id-ID').includes(search))
    )
    .map((account) => {
      const assigned = activeRoleLinks(links, String(account._id));
      const roleRows = roles.filter(
        (role) =>
          assigned.some((link) => String(link.role_id) === String(role._id)) &&
          !role.deleted_at &&
          role.status === 'ACTIVE'
      );
      const systemRole = roleRows.find((role) => role.is_system);
      return {
        id: String(account._id),
        username: account.username,
        name: account.name,
        email: account.email,
        status: account.status,
        roleId: String((systemRole ?? roleRows[0])?._id ?? ''),
        role: systemRole ? 'Super Admin' : roleRows.length ? 'Admin' : 'Tanpa Role',
        roleIds: roleRows.map((role) => String(role._id)),
        roleNames: roleRows.map((role) => role.name),
        lastActive: 'Belum tersedia',
        updatedAt: account.updated_at.toISOString(),
      };
    })
    .filter((account) => !params.roleId || account.roleIds.includes(params.roleId))
    .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  const start = (params.page - 1) * params.pageSize;
  return {
    admins: list.slice(start, start + params.pageSize),
    total: list.length,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total: list.length,
      totalPages: Math.ceil(list.length / params.pageSize),
    },
  };
}

export async function getAdminAccount(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminAccountError('USRB02001', 'ID admin tidak valid.', 400);
  const account = await db.orm.admin_account.where({ _id: id }).first();
  if (!account || account.deleted_at) throw new AdminAccountError('USRB02004', 'Admin tidak ditemukan.', 404);
  const [links, roles] = await Promise.all([db.orm.account_role.all(), db.orm.admin_role.all()]);
  const assigned = activeRoleLinks(links, id);
  const roleRows = roles.filter(
    (role) =>
      assigned.some((link) => String(link.role_id) === String(role._id)) && !role.deleted_at && role.status === 'ACTIVE'
  );
  return {
    id,
    username: account.username,
    name: account.name,
    email: account.email,
    status: account.status,
    roleIds: roleRows.map((role) => String(role._id)),
    roles: roleRows.map((role) => ({ id: String(role._id), name: role.name, code: role.code, system: role.is_system })),
    createdAt: account.created_at.toISOString(),
    updatedAt: account.updated_at.toISOString(),
  };
}

export async function validateAdminAccountInput(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = ['name', 'username', 'email', 'roleIds'];
  if (
    Object.keys(body).some((key) => !keys.includes(key)) ||
    typeof body.name !== 'string' ||
    !body.name.trim() ||
    body.name.trim().length > 150 ||
    typeof body.username !== 'string' ||
    !/^[a-z0-9._-]{3,30}$/i.test(body.username.trim()) ||
    typeof body.email !== 'string' ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    !Array.isArray(body.roleIds) ||
    !body.roleIds.length ||
    body.roleIds.some((id) => typeof id !== 'string' || !ObjectId.isValid(id)) ||
    new Set(body.roleIds).size !== body.roleIds.length
  )
    return null;
  const [existingByName, existingByEmail, roles] = await Promise.all([
    db.orm.admin_account.where({ username: body.username.trim().toLowerCase() }).first(),
    db.orm.admin_account.where({ email: body.email.trim().toLowerCase() }).first(),
    db.orm.admin_role.all(),
  ]);
  if (existingByName || existingByEmail)
    throw new AdminAccountError('USRB02002', 'Username atau email admin sudah digunakan.', 409);
  const selected = roles.filter(
    (role) => (body.roleIds as string[]).includes(String(role._id)) && role.status === 'ACTIVE' && !role.deleted_at
  );
  if (selected.length !== body.roleIds.length)
    throw new AdminAccountError('USRB02003', 'Satu atau lebih role tidak tersedia.', 400);
  return {
    name: body.name.trim(),
    username: body.username.trim().toLowerCase(),
    email: body.email.trim().toLowerCase(),
    roleIds: body.roleIds as string[],
  };
}

export async function updateAdminAccount(id: string, value: unknown, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminAccountError('USRB02001', 'ID admin tidak valid.', 400);
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new AdminAccountError('USRB02001', 'Data admin tidak valid.', 400);
  const body = value as Record<string, unknown>;
  const allowed = ['name', 'username', 'email', 'status', 'roleIds'];
  if (
    !Object.keys(body).length ||
    Object.keys(body).some((key) => !allowed.includes(key)) ||
    (body.name !== undefined &&
      (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 150)) ||
    (body.username !== undefined &&
      (typeof body.username !== 'string' || !/^[a-z0-9._-]{3,30}$/i.test(body.username.trim()))) ||
    (body.email !== undefined &&
      (typeof body.email !== 'string' ||
        body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))) ||
    (body.status !== undefined && !['ACTIVE', 'INACTIVE'].includes(String(body.status))) ||
    (body.roleIds !== undefined &&
      (!Array.isArray(body.roleIds) ||
        body.roleIds.some((roleId) => typeof roleId !== 'string' || !ObjectId.isValid(roleId)) ||
        new Set(body.roleIds).size !== body.roleIds.length))
  )
    throw new AdminAccountError('USRB02001', 'Data admin tidak valid.', 400);
  const account = await db.orm.admin_account.where({ _id: id }).first();
  if (!account || account.deleted_at) throw new AdminAccountError('USRB02004', 'Admin tidak ditemukan.', 404);
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : account.username;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : account.email;
  if (
    (username !== account.username && (await db.orm.admin_account.where({ username }).first())) ||
    (email !== account.email && (await db.orm.admin_account.where({ email }).first()))
  )
    throw new AdminAccountError('USRB02002', 'Username atau email admin sudah digunakan.', 409);
  const allRoles = await db.orm.admin_role.all();
  const oldLinks = (await db.orm.account_role.all()).filter(
    (link) => String(link.admin_account_id) === id && !link.revoked_at
  );
  const oldRoleRows = allRoles.filter(
    (role) => oldLinks.some((link) => String(link.role_id) === String(role._id)) && !role.deleted_at
  );
  const nextIds = body.roleIds as string[] | undefined;
  const newRoleRows = nextIds
    ? allRoles.filter((role) => nextIds.includes(String(role._id)) && role.status === 'ACTIVE' && !role.deleted_at)
    : oldRoleRows;
  if (nextIds && newRoleRows.length !== nextIds.length)
    throw new AdminAccountError('USRB02003', 'Satu atau lebih role tidak tersedia.', 400);
  const remainsSuper = newRoleRows.some((role) => role.is_system && role.code === 'SUPER_ADMIN');
  const removingSuper = oldRoleRows.some((role) => role.is_system && role.code === 'SUPER_ADMIN') && !remainsSuper;
  const disabling = body.status === 'INACTIVE';
  const wasSuper = oldRoleRows.some((role) => role.is_system && role.code === 'SUPER_ADMIN');
  if (wasSuper && (removingSuper || disabling)) {
    const activeAccounts = (await db.orm.admin_account.all()).filter(
      (row) => row.status === 'ACTIVE' && !row.deleted_at
    );
    const systemRoleIds = new Set(
      allRoles
        .filter((role) => role.is_system && role.code === 'SUPER_ADMIN' && !role.deleted_at)
        .map((role) => String(role._id))
    );
    const activeLinks = await db.orm.account_role.all();
    const activeSuperCount = activeAccounts.filter((row) =>
      activeLinks.some(
        (link) =>
          String(link.admin_account_id) === String(row._id) &&
          systemRoleIds.has(String(link.role_id)) &&
          !link.revoked_at
      )
    ).length;
    if (activeSuperCount <= 1)
      throw new AdminAccountError(
        'USRB02005',
        'Super Admin aktif terakhir tidak dapat dinonaktifkan atau kehilangan role-nya.',
        409
      );
  }
  const now = new Date();
  await db.orm.admin_account.where({ _id: id }).update({
    ...(body.name !== undefined ? { name: (body.name as string).trim() } : {}),
    username,
    email,
    ...(body.status !== undefined ? { status: body.status as string } : {}),
    updated_at: now,
  });
  if (nextIds) {
    const links = await db.orm.account_role.all();
    for (const link of links.filter(
      (item) => String(item.admin_account_id) === id && !item.revoked_at && !nextIds.includes(String(item.role_id))
    ))
      await db.orm.account_role.where({ _id: link._id }).update({ revoked_at: now });
    for (const roleId of nextIds) {
      const existing = links.find((item) => String(item.admin_account_id) === id && String(item.role_id) === roleId);
      if (existing)
        await db.orm.account_role.where({ _id: existing._id }).update({ revoked_at: null, assigned_at: now });
      else
        await db.orm.account_role.create({
          _id: new ObjectId().toHexString(),
          admin_account_id: id,
          role_id: roleId,
          assigned_by: verifyAdminAccessToken(getAdminToken(request))?.sub ?? null,
          assigned_at: now,
          revoked_at: null,
        });
    }
  }
  return getAdminAccount(id);
}

export async function deleteAdminAccount(id: string, request: Request) {
  if (!ObjectId.isValid(id)) throw new AdminAccountError('USRB02001', 'ID admin tidak valid.', 400);
  const actor = verifyAdminAccessToken(getAdminToken(request));
  if (actor?.sub === id)
    throw new AdminAccountError('USRB02005', 'Akun yang sedang digunakan tidak dapat dihapus.', 409);
  const account = await db.orm.admin_account.where({ _id: id }).first();
  if (!account || account.deleted_at) throw new AdminAccountError('USRB02004', 'Admin tidak ditemukan.', 404);
  const roles = await db.orm.admin_role.all();
  const links = await db.orm.account_role.all();
  const ownsSystemRole = roles.some(
    (role) =>
      role.is_system &&
      role.code === 'SUPER_ADMIN' &&
      links.some(
        (link) => String(link.admin_account_id) === id && String(link.role_id) === String(role._id) && !link.revoked_at
      )
  );
  if (ownsSystemRole) {
    const activeAccounts = (await db.orm.admin_account.all()).filter(
      (row) => row.status === 'ACTIVE' && !row.deleted_at
    );
    const systemRoleIds = new Set(
      roles
        .filter((role) => role.is_system && role.code === 'SUPER_ADMIN' && !role.deleted_at)
        .map((role) => String(role._id))
    );
    const activeSuperCount = activeAccounts.filter((row) =>
      links.some(
        (link) =>
          String(link.admin_account_id) === String(row._id) &&
          systemRoleIds.has(String(link.role_id)) &&
          !link.revoked_at
      )
    ).length;
    if (activeSuperCount <= 1)
      throw new AdminAccountError('USRB02005', 'Super Admin aktif terakhir tidak dapat dihapus.', 409);
  }
  const now = new Date();
  await db.orm.admin_account.where({ _id: id }).update({ status: 'INACTIVE', deleted_at: now, updated_at: now });
  for (const link of links.filter((item) => String(item.admin_account_id) === id && !item.revoked_at))
    await db.orm.account_role.where({ _id: link._id }).update({ revoked_at: now });
  return { id, deletedAt: now.toISOString() };
}

export function toAdminAccountError(error: unknown) {
  if (error instanceof AdminAccountError) return error;
  return new AdminAccountError('USRT03001', 'Data akun admin sementara tidak tersedia.', 500);
}
