import 'dotenv/config';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '../src/prisma/db';

const username = (process.env['SUPERADMIN_USERNAME'] ?? 'superadmin').trim().toLowerCase();
const password =
  process.env['SUPERADMIN_PASSWORD'] ?? (process.env['NODE_ENV'] === 'production' ? undefined : 'superadmin');
const email = (process.env['SUPERADMIN_EMAIL'] ?? 'superadmin@jokihub.local').trim().toLowerCase();
const secret = process.env['JWT_SECRET'];

if (!username || !password || !email)
  throw new Error('Set SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD, and SUPERADMIN_EMAIL before seeding.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('SUPERADMIN_EMAIL must be a valid email.');
if (!secret || secret.length < 32)
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters before seeding.');
const passwordCharacterClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((pattern) =>
  pattern.test(password)
).length;
if (process.env['NODE_ENV'] === 'production' && (password.length < 16 || passwordCharacterClasses < 3))
  throw new Error('SUPERADMIN_PASSWORD must contain at least 16 characters and use at least 3 character classes.');
const seedPassword = password as string;

async function main() {
  const existing =
    (await db.orm.admin_account.where({ username }).first()) ?? (await db.orm.admin_account.where({ email }).first());
  const now = new Date();
  const password_hash = await hash(seedPassword, 12);

  let adminId: string;
  if (existing) {
    await db.orm.admin_account
      .where({ _id: existing._id })
      .update({ username, email, password_hash, status: 'ACTIVE', deleted_at: null, updated_at: now });
    adminId = String(existing._id);
    console.log(`Updated bcrypt credential for admin ${username}.`);
  } else {
    const admin = await db.orm.admin_account.create({
      _id: new ObjectId().toHexString(),
      username,
      email,
      name: 'Super Admin',
      password_hash,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    adminId = String(admin._id);
    console.log(`Created admin ${username}.`);
  }

  let role = await db.orm.admin_role.where({ code: 'SUPER_ADMIN' }).first();
  if (role) {
    await db.orm.admin_role.where({ _id: role._id }).update({ status: 'ACTIVE', deleted_at: null, updated_at: now });
  } else {
    role = await db.orm.admin_role.create({
      _id: new ObjectId().toHexString(),
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Full administrative role.',
      status: 'ACTIVE',
      is_system: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
  }
  const assignment = await db.orm.account_role.where({ admin_account_id: adminId, role_id: String(role._id) }).first();
  if (assignment) {
    await db.orm.account_role.where({ _id: assignment._id }).update({ revoked_at: null, assigned_at: now });
  } else {
    await db.orm.account_role.create({
      _id: new ObjectId().toHexString(),
      admin_account_id: adminId,
      role_id: String(role._id),
      assigned_by: null,
      assigned_at: now,
      revoked_at: null,
    });
  }

  const permissionDefinitions = [
    ['dashboard-read', 'Dashboard'],
    ['orders-manage', 'Pesanan'],
    ['catalog-manage', 'Produk & Layanan'],
    ['users-manage', 'Pengguna'],
    ['content-manage', 'Konten'],
    ['finance-read', 'Keuangan'],
    ['settings-manage', 'Pengaturan'],
  ] as const;
  for (const [code, name] of permissionDefinitions) {
    let permission = await db.orm.permission.where({ code }).first();
    if (!permission) {
      permission = await db.orm.permission.create({
        _id: new ObjectId().toHexString(),
        code,
        name,
        description: `Izin ${name.toLowerCase()} pada dashboard.`,
        is_sensitive: code === 'settings-manage' || code === 'users-manage',
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    } else if (!permission.is_active) {
      await db.orm.permission.where({ _id: permission._id }).update({ is_active: true, updated_at: now });
    }
    const rolePermission = await db.orm.role_permission
      .where({ role_id: String(role._id), permission_id: String(permission._id) })
      .first();
    if (!rolePermission) {
      await db.orm.role_permission.create({
        _id: new ObjectId().toHexString(),
        role_id: String(role._id),
        permission_id: String(permission._id),
        granted_by: null,
        created_at: now,
      });
    }
  }

  await db.close();
}

main().catch((error: unknown) => {
  console.error(error);
  if (error && typeof error === 'object' && 'errInfo' in error) {
    console.error('Mongo validation detail:', JSON.stringify((error as { errInfo?: unknown }).errInfo));
  }
  void db.close().finally(() => {
    process.exitCode = 1;
  });
});
