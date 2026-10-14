import { compare, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { createAdminAccessToken } from './admin-token';
import { resolveAdminAuthorization } from './admin-authorization';
import { createCustomerAccessToken } from './customer-token';

export type AuthenticatedAccount =
  | {
      accountType: 'CUSTOMER';
      accessToken: string;
      account: { id: string; name: string; username: string; email: string };
    }
  | {
      accountType: 'ADMIN';
      accessToken: string;
      role: 'ADMIN' | 'SUPER_ADMIN';
      account: { id: string; name: string; username: string; email: string };
    };

export class AuthenticationServiceError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export type CustomerRegistrationInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  whatsapp?: string;
};

async function authenticateAdmin(identifier: string, password: string): Promise<AuthenticatedAccount | null> {
  const admin =
    (await db.orm.admin_account.where({ username: identifier, status: 'ACTIVE' }).first()) ??
    (await db.orm.admin_account.where({ email: identifier, status: 'ACTIVE' }).first());
  if (!admin || admin.deleted_at || !(await compare(password, admin.password_hash))) return null;
  const authorization = await resolveAdminAuthorization(String(admin._id));
  if (!authorization) return null;
  return {
    accountType: 'ADMIN',
    accessToken: createAdminAccessToken({ sub: String(admin._id), username: admin.username, ...authorization }),
    role: authorization.role,
    account: { id: String(admin._id), name: admin.name, username: admin.username, email: admin.email },
  };
}

export async function authenticateAccount(
  identifier: string,
  password: string,
  options: { adminOnly?: boolean } = {}
): Promise<AuthenticatedAccount | null> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!options.adminOnly) {
    const user =
      (await db.orm.user_account.where({ username: normalizedIdentifier, status: 'ACTIVE' }).first()) ??
      (await db.orm.user_account.where({ email: normalizedIdentifier, status: 'ACTIVE' }).first());
    if (user && !user.deleted_at && (await compare(password, user.password_hash))) {
      return {
        accountType: 'CUSTOMER',
        accessToken: createCustomerAccessToken({
          sub: String(user._id),
          username: user.username,
          role: 'CUSTOMER',
        }),
        account: { id: String(user._id), name: user.name, username: user.username, email: user.email },
      };
    }
  }
  return authenticateAdmin(normalizedIdentifier, password);
}

export async function registerCustomer(input: CustomerRegistrationInput) {
  const settings = await db.orm.platform_settings.where({ singleton_key: 'current' }).first();
  if (settings && !settings.allow_registration) {
    throw new AuthenticationServiceError('AUTB02003', 'Pendaftaran akun sedang ditutup.', 403);
  }
  if (
    (await db.orm.user_account.where({ username: input.username }).first()) ||
    (await db.orm.user_account.where({ email: input.email }).first())
  ) {
    throw new AuthenticationServiceError('AUTB02002', 'Username atau email sudah digunakan.', 409);
  }

  const now = new Date();
  const userId = new ObjectId().toHexString();
  const user = await db.orm.user_account.create({
    _id: userId,
    email: input.email,
    username: input.username,
    name: input.name,
    ...(input.whatsapp ? { whatsapp: input.whatsapp } : {}),
    password_hash: await hash(input.password, 12),
    status: 'ACTIVE',
    joined_at: now,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  try {
    await db.orm.member_profile.create({ _id: userId, tier: 'BRONZE', created_at: now, updated_at: now });
  } catch (error) {
    await db.orm.user_account.where({ _id: userId }).delete();
    throw error;
  }
  const accessToken = createCustomerAccessToken({ sub: String(user._id), username: input.username, role: 'CUSTOMER' });
  return {
    accessToken,
    account: { id: String(user._id), name: input.name, username: input.username, email: input.email },
  };
}

export function toAuthenticationServiceError(error: unknown) {
  if (error instanceof AuthenticationServiceError) return error;
  return new AuthenticationServiceError('AUTT03001', 'Layanan autentikasi sedang tidak tersedia.', 500);
}
