export type AdminAccountRole = 'Admin' | 'Super Admin';
export type AdminAccountStatus = 'Aktif' | 'Nonaktif';

export type AdminAccountView = {
  id: string;
  name: string;
  email: string;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  lastActive: string;
};

export type AdminAccountForm = Omit<AdminAccountView, 'id' | 'lastActive'>;
export type AdminAccountRoleFilter = 'Semua Role' | AdminAccountRole;
export type AdminAccountStatusFilter = 'Semua' | AdminAccountStatus;
export type AdminAccountFormMode = 'create' | 'edit' | null;
