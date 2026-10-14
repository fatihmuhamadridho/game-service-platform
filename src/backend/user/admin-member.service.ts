import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';

export class AdminMemberError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const activeUser = (user: { deleted_at: Date | null }) => !user.deleted_at;
const usernamePattern = /^[a-z0-9._-]{3,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AdminMemberUpdate = {
  name?: string;
  username?: string;
  email?: string;
  whatsapp?: string | null;
  status?: 'ACTIVE' | 'BLOCKED';
};

export type AdminMemberInvitation = { name: string; username: string; email: string };

export function parseAdminMemberUpdate(value: unknown): AdminMemberUpdate | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = ['name', 'username', 'email', 'whatsapp', 'status'];
  if (!Object.keys(body).length || Object.keys(body).some((key) => !keys.includes(key))) return null;
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 150))
    return null;
  if (
    body.username !== undefined &&
    (typeof body.username !== 'string' || !usernamePattern.test(body.username.trim().toLowerCase()))
  )
    return null;
  if (
    body.email !== undefined &&
    (typeof body.email !== 'string' || body.email.length > 254 || !emailPattern.test(body.email.trim()))
  )
    return null;
  if (
    body.whatsapp !== undefined &&
    body.whatsapp !== null &&
    (typeof body.whatsapp !== 'string' || !/^\+[1-9]\d{7,14}$/.test(body.whatsapp))
  )
    return null;
  if (body.status !== undefined && !['ACTIVE', 'BLOCKED'].includes(String(body.status))) return null;
  return {
    ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
    ...(typeof body.username === 'string' ? { username: body.username.trim().toLowerCase() } : {}),
    ...(typeof body.email === 'string' ? { email: body.email.trim().toLowerCase() } : {}),
    ...(typeof body.whatsapp === 'string' || body.whatsapp === null ? { whatsapp: body.whatsapp } : {}),
    ...(typeof body.status === 'string' ? { status: body.status as 'ACTIVE' | 'BLOCKED' } : {}),
  };
}

export function parseAdminMemberInvitation(value: unknown): AdminMemberInvitation | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => !['name', 'username', 'email', 'accountType'].includes(key))) return null;
  if (body.accountType !== undefined && body.accountType !== 'MEMBER') return null;
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 150) return null;
  if (typeof body.username !== 'string' || !usernamePattern.test(body.username.trim().toLowerCase())) return null;
  if (typeof body.email !== 'string' || body.email.length > 254 || !emailPattern.test(body.email.trim())) return null;
  return {
    name: body.name.trim(),
    username: body.username.trim().toLowerCase(),
    email: body.email.trim().toLowerCase(),
  };
}

export async function inviteAdminMember(input: AdminMemberInvitation): Promise<never> {
  if (
    (await db.orm.user_account.where({ username: input.username }).first()) ||
    (await db.orm.user_account.where({ email: input.email }).first())
  ) {
    throw new AdminMemberError('USRB02002', 'Username atau email sudah digunakan.', 409);
  }
  throw new AdminMemberError(
    'USRT02001',
    'Undangan user belum tersedia karena layanan email/identity belum dikonfigurasi.',
    503
  );
}

export async function listAdminMembers(input: {
  page: number;
  pageSize: number;
  search: string;
  status: '' | 'ACTIVE' | 'BLOCKED';
}) {
  const records = await db.orm.user_account.all();
  const filtered = records
    .filter(
      (user) =>
        activeUser(user) &&
        (!input.status || user.status === input.status) &&
        (!input.search || `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(input.search))
    )
    .sort((a, b) => b.joined_at.getTime() - a.joined_at.getTime() || String(b._id).localeCompare(String(a._id)));
  const pageRecords = filtered.slice((input.page - 1) * input.pageSize, input.page * input.pageSize);
  const [profiles, orders] = await Promise.all([db.orm.member_profile.all(), db.orm.customer_order.all()]);
  const users = pageRecords.map((user) => {
    const userOrders = orders.filter((order) => String(order.user_id) === String(user._id));
    return {
      id: String(user._id),
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      joinedAt: user.joined_at.toISOString(),
      accountType: 'MEMBER' as const,
      tier: profiles.find((profile) => String(profile._id) === String(user._id))?.tier ?? 'BRONZE',
      orderCount: userOrders.length,
      totalSpend: userOrders
        .filter((order) => order.payment_status === 'PAID')
        .reduce((sum, order) => sum + Number(order.total_amount), 0),
    };
  });
  return {
    users,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / input.pageSize),
    },
  };
}

export async function getAdminMember(userId: string) {
  const user = await db.orm.user_account.where({ _id: userId }).first();
  if (!user || !activeUser(user)) throw new AdminMemberError('USRB02004', 'User tidak ditemukan.', 404);
  const [member, orders] = await Promise.all([
    db.orm.member_profile.where({ _id: userId }).first(),
    db.orm.customer_order.where({ user_id: userId }).all(),
  ]);
  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    email: user.email,
    whatsapp: user.whatsapp ?? null,
    status: user.status,
    accountType: 'MEMBER' as const,
    tier: member?.tier ?? 'BRONZE',
    joinedAt: user.joined_at.toISOString(),
    orderCount: orders.length,
    totalSpend: orders
      .filter((order) => order.payment_status === 'PAID')
      .reduce((sum, order) => sum + Number(order.total_amount), 0),
  };
}

export async function updateAdminMember(userId: string, body: AdminMemberUpdate, actorId: string | null) {
  const user = await db.orm.user_account.where({ _id: userId }).first();
  if (!user || !activeUser(user)) throw new AdminMemberError('USRB02004', 'User tidak ditemukan.', 404);
  const username = body.username ?? user.username;
  const email = body.email ?? user.email;
  if (
    (username !== user.username && (await db.orm.user_account.where({ username }).first())) ||
    (email !== user.email && (await db.orm.user_account.where({ email }).first()))
  )
    throw new AdminMemberError('USRB02002', 'Username atau email sudah digunakan.', 409);
  const now = new Date();
  await db.orm.user_account.where({ _id: userId }).update({
    ...(body.name !== undefined ? { name: body.name } : {}),
    username,
    email,
    ...(body.whatsapp !== undefined ? { whatsapp: body.whatsapp } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    updated_at: now,
  });
  if (body.status !== undefined && body.status !== user.status) {
    await db.orm.user_status_history.create({
      _id: new ObjectId().toHexString(),
      user_id: userId,
      old_status: user.status,
      new_status: body.status,
      changed_by: actorId,
      reason: null,
      changed_at: now,
    });
  }
  const updated = await db.orm.user_account.where({ _id: userId }).first();
  return {
    id: String(updated?._id),
    name: updated?.name,
    username: updated?.username,
    email: updated?.email,
    status: updated?.status,
  };
}

export async function deleteAdminMember(userId: string) {
  const user = await db.orm.user_account.where({ _id: userId }).first();
  if (!user || !activeUser(user)) throw new AdminMemberError('USRB02004', 'User tidak ditemukan.', 404);
  const now = new Date();
  await db.orm.user_account.where({ _id: userId }).update({ deleted_at: now, status: 'BLOCKED', updated_at: now });
  return { deleted: true };
}

export function toAdminMemberError(error: unknown) {
  if (error instanceof AdminMemberError) return error;
  return new AdminMemberError('USRT03001', 'User sedang tidak tersedia.', 500);
}
