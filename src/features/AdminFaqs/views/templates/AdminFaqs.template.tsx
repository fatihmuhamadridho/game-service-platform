'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconHelpCircle, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminFaqForm,
  AdminFaqFormMode,
  AdminFaqStatus,
  AdminFaqStatusFilter,
  AdminFaqView,
} from '../interfaces/admin-faq.interface';
import styles from '../pages/AdminFaqs.module.css';

type Props = {
  faqs: AdminFaqView[];
  filteredFaqs: AdminFaqView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminFaqStatusFilter;
  onStatusFilterChange: (value: AdminFaqStatusFilter) => void;
  publishedCount: number;
  formMode: AdminFaqFormMode;
  form: AdminFaqForm;
  onFormChange: (updater: (current: AdminFaqForm) => AdminFaqForm) => void;
  onCreate: () => void;
  onEdit: (faq: AdminFaqView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminFaqView | null;
  onDeleteSelect: (faq: AdminFaqView | null) => void;
  onDeleteConfirm: () => void;
};

export const AdminFaqsTemplate = ({
  faqs,
  filteredFaqs,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  publishedCount,
  formMode,
  form,
  onFormChange,
  onCreate,
  onEdit,
  onSave,
  onCloseForm,
  deleteTarget,
  onDeleteSelect,
  onDeleteConfirm,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateField = <K extends keyof AdminFaqForm>(field: K, value: AdminFaqForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="FAQ" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Konten <span>/</span> <b>FAQ</b>
            </p>
            <h1>Kelola FAQ</h1>
            <p>Atur pertanyaan dan jawaban yang membantu pengguna.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah FAQ
          </button>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan FAQ">
          <Box className={styles.metric} bordered rounded>
            <span>Total FAQ</span>
            <b>{faqs.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Published</span>
            <b className={styles.publishedValue}>{publishedCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Draft</span>
            <b className={styles.draftValue}>{faqs.length - publishedCount}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar FAQ</h2>
              <small>{filteredFaqs.length} FAQ ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari pertanyaan atau jawaban..."
                  aria-label="Cari FAQ"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminFaqStatusFilter)}
                >
                  <option>Semua Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Pertanyaan & Jawaban</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id}>
                    <td>
                      <span className={styles.faqCell}>
                        <i>
                          <IconHelpCircle />
                        </i>
                        <span>
                          <b>{faq.question}</b>
                          <small>{faq.answer}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.category}>{faq.category}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${faq.status === 'Published' ? styles.statusPublished : styles.statusDraft}`}
                      >
                        <i />
                        {faq.status}
                      </span>
                    </td>
                    <td>{faq.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit ${faq.question}`} onClick={() => onEdit(faq)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${faq.question}`}
                          onClick={() => onDeleteSelect(faq)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredFaqs.length && (
              <div className={styles.empty}>
                <IconHelpCircle />
                <b>FAQ tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>Data contoh. Perubahan hanya tersimpan selama halaman ini terbuka.</p>
        </Box>
      </div>
      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="faq-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="faq-dialog-title">{formMode === 'create' ? 'Tambah FAQ' : 'Edit FAQ'}</h2>
                <p>Lengkapi pertanyaan dan jawaban untuk pengguna.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Pertanyaan
                <input
                  required
                  autoFocus
                  value={form.question}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('question', event.target.value)}
                  placeholder="Contoh: Bagaimana cara membuat pesanan?"
                />
              </label>
              <label>
                Jawaban
                <textarea
                  required
                  rows={6}
                  value={form.answer}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('answer', event.target.value)}
                  placeholder="Tulis jawaban yang jelas untuk pengguna..."
                />
              </label>
              <label>
                Kategori
                <input
                  required
                  value={form.category}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('category', event.target.value)}
                  placeholder="Contoh: Pembayaran"
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    updateField('status', event.target.value as AdminFaqStatus)
                  }
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
              <p className={styles.formNote}>Status publikasi hanya simulasi; FAQ belum ditampilkan di storefront.</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan FAQ' : 'Simpan Perubahan'}
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
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-faq-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-faq-title">Hapus FAQ ini?</h2>
                <p>{deleteTarget.question}</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button className={`${styles.createButton} ${styles.confirmDelete}`} onClick={onDeleteConfirm}>
                <IconTrash /> Hapus FAQ
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
