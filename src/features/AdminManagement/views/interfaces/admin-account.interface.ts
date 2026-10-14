export type AdminAccountRole = 'Admin' | 'Super Admin';
export type AdminAccountStatus = 'Aktif' | 'Nonaktif';

export type AdminAccountView = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AdminAccountRole;
  roleIds: string[];
  status: AdminAccountStatus;
  lastActive: string;
};

export type AdminAccountForm = {
  name: string;
  username: string;
  email: string;
  roleIds: string[];
  status: AdminAccountStatus;
};
export type AdminAccountRoleFilter = 'Semua Role' | AdminAccountRole;
export type AdminAccountStatusFilter = 'Semua' | AdminAccountStatus;
export type AdminAccountFormMode = 'create' | 'edit' | null;
