'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  BankAccountForm,
  BankAccountStatusFilter,
  BankAccountView,
} from '../interfaces/admin-bank-account.interface';
import { AdminBankAccountsTemplate } from '../templates/AdminBankAccounts.template';

const seedAccounts: BankAccountView[] = [
  {
    id: 'bank-1',
    bankName: 'BCA',
    accountNumber: '•••• •••• 4821',
    accountHolder: 'PT JokiHub Indonesia',
    label: 'Rekening operasional',
    status: 'Aktif',
    isPrimary: true,
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'bank-2',
    bankName: 'Mandiri',
    accountNumber: '•••• •••• 1732',
    accountHolder: 'PT JokiHub Indonesia',
    label: 'Rekening cadangan',
    status: 'Aktif',
    isPrimary: false,
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'bank-3',
    bankName: 'BNI',
    accountNumber: '•••• •••• 9255',
    accountHolder: 'JokiHub Digital',
    label: 'Rekening lama',
    status: 'Nonaktif',
    isPrimary: false,
    updatedAt: '8 Okt 2026',
  },
];
const emptyForm: BankAccountForm = {
  bankName: 'BCA',
  accountNumber: '',
  accountHolder: '',
  label: '',
  status: 'Aktif',
  isPrimary: false,
};

export const AdminBankAccountsPage = () => {
  const [accounts, setAccounts] = useState(seedAccounts);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BankAccountStatusFilter>('Semua Status');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BankAccountForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<BankAccountView | null>(null);
  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          `${account.bankName} ${account.accountNumber} ${account.accountHolder} ${account.label}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || account.status === statusFilter)
      ),
    [accounts, query, statusFilter]
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };
  const openEdit = (account: BankAccountView) => {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      label: account.label,
      status: account.status,
      isPrimary: account.isPrimary,
    });
    setFormMode('edit');
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = {
      ...form,
      accountNumber: form.accountNumber.trim(),
      accountHolder: form.accountHolder.trim(),
      label: form.label.trim(),
      updatedAt: 'Baru saja',
    };
    setAccounts((current) =>
      current
        .map((account) => ({ ...account, isPrimary: next.isPrimary ? false : account.isPrimary }))
        .map((account) => (formMode === 'edit' && account.id === editingId ? { ...account, ...next } : account))
    );
    if (formMode === 'create') setAccounts((current) => [{ id: `bank-${Date.now()}`, ...next }, ...current]);
    setFormMode(null);
  };
  const makePrimary = (id: string) =>
    setAccounts((current) => current.map((account) => ({ ...account, isPrimary: account.id === id })));
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAccounts((current) => current.filter((account) => account.id !== deleteTarget.id));
    setDeleteTarget(null);
  };
  return (
    <AdminBankAccountsTemplate
      accounts={accounts}
      filteredAccounts={filteredAccounts}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      formMode={formMode}
      form={form}
      onFormChange={setForm}
      onCreate={openCreate}
      onEdit={openEdit}
      onSave={handleSave}
      onCloseForm={() => setFormMode(null)}
      onMakePrimary={makePrimary}
      deleteTarget={deleteTarget}
      onDeleteSelect={setDeleteTarget}
      onDeleteConfirm={confirmDelete}
    />
  );
};
