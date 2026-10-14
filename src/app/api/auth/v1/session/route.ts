import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { getCustomerClaims } from '@backend/auth/customer-auth';

type AccountType = 'ADMIN' | 'CUSTOMER';

function response(data: unknown, status = 200) {
  return NextResponse.json(
    { status: { code: status === 200 ? 'AUTS00000' : 'AUTB01001', message: 'Status sesi.' }, data },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET(request: Request) {
  const requestedType = new URL(request.url).searchParams.get('accountType');
  const accountType: AccountType | null =
    requestedType === 'ADMIN' || requestedType === 'CUSTOMER' ? requestedType : null;

  if (accountType !== 'CUSTOMER') {
    const token = getAdminToken(request);
    const claims = token ? await verifyAdminAccessToken(token) : null;
    if (claims) {
      const admin = await db.orm.admin_account.where({ _id: claims.sub, status: 'ACTIVE' }).first();
      if (admin && !admin.deleted_at) {
        return response({
          accountType: 'ADMIN',
          name: admin.name,
          username: admin.username,
          role: claims.role,
          roleLabel: claims.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
          canAccessDashboard:
            claims.role === 'SUPER_ADMIN' ||
            claims.permissions.includes('*') ||
            claims.permissions.includes('dashboard-read'),
        });
      }
    }
  }

  if (accountType !== 'ADMIN') {
    const claims = await getCustomerClaims(request);
    if (claims) {
      const customer = await db.orm.user_account.where({ _id: claims.sub, status: 'ACTIVE' }).first();
      if (customer && !customer.deleted_at) {
        return response({
          accountType: 'CUSTOMER',
          name: customer.name,
          username: customer.username,
          role: 'CUSTOMER',
          roleLabel: 'Member',
          canAccessDashboard: false,
        });
      }
    }
  }

  return response(null, 401);
}
