export type AdminUserRole = 'Member';
export type AdminUserStatus = 'Aktif' | 'Diblokir';

export type AdminUserView = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
  whatsapp?: string | null;
  tier?: string;
  orderCount?: number;
  totalSpend?: number;
};

export type AdminUserForm = Omit<AdminUserView, 'id' | 'joinedAt'>;
export type AdminUserStatusFilter = 'Semua' | AdminUserStatus;
export type AdminUserRoleFilter = 'Semua Role' | AdminUserRole;
export type AdminUserFormMode = 'create' | 'edit' | null;
