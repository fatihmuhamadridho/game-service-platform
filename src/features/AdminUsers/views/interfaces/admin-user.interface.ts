export type AdminUserRole = 'Member' | 'Admin' | 'Super Admin';
export type AdminUserStatus = 'Aktif' | 'Diblokir';

export type AdminUserView = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
};

export type AdminUserForm = Omit<AdminUserView, 'id' | 'joinedAt'>;
export type AdminUserStatusFilter = 'Semua' | AdminUserStatus;
export type AdminUserRoleFilter = 'Semua Role' | AdminUserRole;
export type AdminUserFormMode = 'create' | 'edit' | null;
