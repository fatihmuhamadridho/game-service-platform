import { db } from '@prisma/db';

export async function resolveAdminAuthorization(adminId: string) {
  const [assignments, roles, rolePermissions, permissions] = await Promise.all([
    db.orm.account_role.all(),
    db.orm.admin_role.all(),
    db.orm.role_permission.all(),
    db.orm.permission.all(),
  ]);
  const assignedRoleIds = new Set(
    assignments
      .filter((item) => String(item.admin_account_id) === adminId && !item.revoked_at)
      .map((item) => String(item.role_id))
  );
  const activeRoles = roles.filter(
    (item) => assignedRoleIds.has(String(item._id)) && item.status === 'ACTIVE' && !item.deleted_at
  );
  if (!activeRoles.length) return null;
  const isSuperAdmin = activeRoles.some((item) => item.is_system && item.code === 'SUPER_ADMIN');
  const permissionIds = new Set(
    rolePermissions
      .filter((item) => activeRoles.some((role) => String(role._id) === String(item.role_id)))
      .map((item) => String(item.permission_id))
  );
  const permissionCodes = permissions
    .filter((item) => permissionIds.has(String(item._id)) && item.is_active)
    .map((item) => item.code);
  if (isSuperAdmin) permissionCodes.push('*');
  return { role: isSuperAdmin ? ('SUPER_ADMIN' as const) : ('ADMIN' as const), permissions: permissionCodes };
}
