export type BankAccountStatus = 'Aktif' | 'Nonaktif';
export type BankAccountView = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  label: string;
  status: BankAccountStatus;
  isPrimary: boolean;
  updatedAt: string;
};
export type BankAccountForm = Omit<BankAccountView, 'id' | 'updatedAt'>;
export type BankAccountStatusFilter = 'Semua Status' | BankAccountStatus;
export type BankAccountFormMode = 'create' | 'edit' | null;
