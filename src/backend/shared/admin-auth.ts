import { apiFailure } from './api-response';
import { getAdminToken, verifyAdminAccessToken } from '../auth/admin-token';

export function requireAdminApi(code = 'GAMB01001', request?: Request) {
  const prefix = code.slice(0, 3);
  const required: Record<string, string[]> = {
    DAS: ['dashboard-read'],
    ACT: ['dashboard-read', 'settings-manage'],
    ORD: ['orders-manage'],
    TRX: ['finance-read'],
    ROL: ['settings-manage'],
    SCA: ['catalog-manage'],
    SRV: ['catalog-manage'],
    USR: ['users-manage'],
    GAM: ['catalog-manage'],
    SET: ['settings-manage'],
  };
  return requireAdminPermissions(code, request, required[prefix] ?? []);
}

export function requireAdminPermissions(code: string, request: Request | undefined, requiredPermissions: string[]) {
  const token = request ? getAdminToken(request) : '';
  const claims = token ? verifyAdminAccessToken(token) : null;
  if (!claims) return apiFailure(code, 'Sesi administrator tidak tersedia.', 401);
  if (!claims.permissions.includes('*')) {
    if (!requiredPermissions.some((permission) => claims.permissions.includes(permission)))
      return apiFailure(code.replace('01001', '01002'), 'Administrator tidak memiliki izin untuk tindakan ini.', 403);
  }
  return null;
}

export function adminApiUnavailable(code: string, request: Request) {
  const denied = requireAdminApi(code, request);
  return denied ?? apiFailure('ADMT05001', 'Handler endpoint ini belum tersedia.', 501);
}
