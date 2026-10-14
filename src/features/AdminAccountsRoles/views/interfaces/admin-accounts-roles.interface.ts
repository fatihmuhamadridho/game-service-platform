export type PermissionKey = 'dashboard' | 'orders' | 'catalog' | 'users' | 'content' | 'finance' | 'settings';
export type Permission = { key: PermissionKey; label: string; description: string };
export type RoleView = {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
  adminCount: number;
  permissions: PermissionKey[];
  protected?: boolean;
};
export type PermissionCatalogItem = { id: string; code: string; name: string; key: PermissionKey };
export type RoleForm = Pick<RoleView, 'name' | 'description' | 'permissions'>;
export type RoleFormMode = 'create' | 'edit' | null;
