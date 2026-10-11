'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconBuildingBank, IconEdit, IconPlus, IconSearch, IconStar, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  BankAccountForm,
  BankAccountFormMode,
  BankAccountStatus,
  BankAccountStatusFilter,
  BankAccountView,
} from '../interfaces/admin-bank-account.interface';
import styles from '../pages/AdminBankAccounts.module.css';

type Props = {
  accounts: BankAccountView[];
  filteredAccounts: BankAccountView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: BankAccountStatusFilter;
  onStatusFilterChange: (value: BankAccountStatusFilter) => void;
  formMode: BankAccountFormMode;
  form: BankAccountForm;
  onFormChange: (updater: (current: BankAccountForm) => BankAccountForm) => void;
  onCreate: () => void;
  onEdit: (account: BankAccountView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  onMakePrimary: (id: string) => void;
  deleteTarget: BankAccountView | null;
  onDeleteSelect: (account: BankAccountView | null) => void;
  onDeleteConfirm: () => void;
};
const banks = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga', 'Bank Lain'];

export const AdminBankAccountsTemplate = ({
  accounts,
  filteredAccounts,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  formMode,
  form,
  onFormChange,
  onCreate,
  onEdit,
  onSave,
  onCloseForm,
  onMakePrimary,
  deleteTarget,
  onDeleteSelect,
  onDeleteConfirm,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateField = <K extends keyof BankAccountForm>(field: K, value: BankAccountForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const activeCount = accounts.filter((account) => account.status === 'Aktif').length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Rekening" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Keuangan <span>/</span> <b>Rekening</b>
            </p>
            <h1>Manajemen Rekening</h1>
            <p>Kelola rekening tujuan pembayaran dan pencairan dana.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah Rekening
          </button>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan rekening">
          <Box className={styles.metric} bordered rounded>
            <span>Total Rekening</span>
            <b>{accounts.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Rekening Aktif</span>
            <b className={styles.successValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Rekening Utama</span>
            <b className={styles.accentValue}>{accounts.some((account) => account.isPrimary) ? 1 : 0}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Rekening</h2>
              <small>
                {filteredAccounts.length} dari {accounts.length} rekening ditampilkan
              </small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari bank, pemilik, atau label..."
                  aria-label="Cari rekening"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as BankAccountStatusFilter)}
                >
                  <option>Semua Status</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Bank</th>
                  <th>Nomor Rekening</th>
                  <th>Nama Pemilik</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <span className={styles.bankCell}>
                        <i>
                          <IconBuildingBank />
                        </i>
                        <b>{account.bankName}</b>
                      </span>
                    </td>
                    <td>
                      <span className={styles.numberCell}>
                        {account.accountNumber}
                        {account.isPrimary && (
                          <em>
                            <IconStar />
                            Utama
                          </em>
                        )}
                      </span>
                    </td>
                    <td>{account.accountHolder}</td>
                    <td>{account.label}</td>
                    <td>
                      <span
                        className={`${styles.status} ${account.status === 'Aktif' ? styles.statusActive : styles.statusInactive}`}
                      >
                        <i />
                        {account.status}
                      </span>
                    </td>
                    <td>{account.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        {!account.isPrimary && account.status === 'Aktif' && (
                          <button
                            aria-label={`Jadikan ${account.bankName} rekening utama`}
                            onClick={() => onMakePrimary(account.id)}
                          >
                            <IconStar /> Utama
                          </button>
                        )}
                        <button aria-label={`Edit rekening ${account.bankName}`} onClick={() => onEdit(account)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus rekening ${account.bankName}`}
                          onClick={() => onDeleteSelect(account)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredAccounts.length && (
              <div className={styles.empty}>
                <IconBuildingBank />
                <b>Rekening tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data contoh. Nomor rekening disamarkan. Perubahan hanya tersimpan selama halaman ini terbuka.
          </p>
        </Box>
      </div>
      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="bank-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="bank-dialog-title">{formMode === 'create' ? 'Tambah Rekening' : 'Edit Rekening'}</h2>
                <p>Lengkapi rekening bank tujuan pembayaran atau payout.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <div className={styles.formRow}>
                <label>
                  Nama Bank
                  <select
                    value={form.bankName}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('bankName', event.target.value)}
                  >
                    {banks.map((bank) => (
                      <option key={bank}>{bank}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('status', event.target.value as BankAccountStatus)
                    }
                  >
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
                </label>
              </div>
              <label>
                Nomor Rekening
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6,20}"
                  value={form.accountNumber}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('accountNumber', event.target.value.replace(/\D/g, ''))
                  }
                  placeholder="Masukkan 6–20 digit nomor rekening"
                />
                <small>Nomor akan ditampilkan dalam bentuk tersamarkan.</small>
              </label>
              <label>
                Nama Pemilik Rekening
                <input
                  required
                  value={form.accountHolder}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('accountHolder', event.target.value)}
                  placeholder="Sesuai nama pada rekening"
                />
              </label>
              <label>
                Label Internal
                <input
                  required
                  value={form.label}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('label', event.target.value)}
                  placeholder="Contoh: Rekening operasional"
                />
              </label>
              <label className={styles.primaryToggle}>
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('isPrimary', event.target.checked)}
                />
                <span>Jadikan rekening utama</span>
              </label>
              <p className={styles.formNote}>Prototipe belum menyimpan data ke server.</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Rekening' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {deleteTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onDeleteSelect(null);
          }}
        >
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-bank-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-bank-title">Hapus rekening {deleteTarget.bankName}?</h2>
                <p>
                  {deleteTarget.isPrimary
                    ? 'Rekening utama tidak dapat dihapus. Jadikan rekening lain sebagai utama lebih dulu.'
                    : 'Rekening ini dihapus dari daftar pada sesi ini.'}
                </p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button
                className={`${styles.createButton} ${styles.confirmDelete}`}
                disabled={deleteTarget.isPrimary}
                onClick={onDeleteConfirm}
              >
                <IconTrash /> Hapus Rekening
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
