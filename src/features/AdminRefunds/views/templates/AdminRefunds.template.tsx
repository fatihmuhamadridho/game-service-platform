'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEye, IconReceipt, IconSearch, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type { RefundStatus, RefundStatusFilter, RefundView } from '../interfaces/admin-refund.interface';
import styles from '../pages/AdminRefunds.module.css';

type Props = {
  refunds: RefundView[];
  filteredRefunds: RefundView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: RefundStatusFilter;
  onStatusFilterChange: (value: RefundStatusFilter) => void;
  detailTarget: RefundView | null;
  onView: (refund: RefundView) => void;
  onCloseDetail: () => void;
  onStatusChange: (id: string, status: RefundStatus, adminNote: string) => void;
  formatRupiah: (amount: number) => string;
};
const statuses: RefundStatusFilter[] = ['Semua Status', 'Menunggu Review', 'Disetujui', 'Ditolak', 'Selesai'];
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const statusClass = (status: RefundStatus) =>
  status === 'Selesai'
    ? styles.statusDone
    : status === 'Disetujui'
      ? styles.statusApproved
      : status === 'Ditolak'
        ? styles.statusRejected
        : styles.statusWaiting;

export const AdminRefundsTemplate = ({
  refunds,
  filteredRefunds,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  detailTarget,
  onView,
  onCloseDetail,
  onStatusChange,
  formatRupiah,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const pendingCount = refunds.filter((refund) => refund.status === 'Menunggu Review').length;
  const approvedCount = refunds.filter((refund) => refund.status === 'Disetujui').length;
  const completedCount = refunds.filter((refund) => refund.status === 'Selesai').length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Refund" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Order <span>/</span> <b>Refund</b>
            </p>
            <h1>Manajemen Refund</h1>
            <p>Tinjau permintaan pengembalian dana dan catat keputusan admin.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan refund">
          <Box className={styles.metric} bordered rounded>
            <span>Total Permintaan</span>
            <b>{refunds.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Menunggu Review</span>
            <b className={styles.warningValue}>{pendingCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Disetujui</span>
            <b className={styles.accentValue}>{approvedCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Selesai</span>
            <b className={styles.successValue}>{completedCount}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Permintaan Refund</h2>
              <small>
                {filteredRefunds.length} dari {refunds.length} permintaan ditampilkan
              </small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari refund, pesanan, atau pelanggan..."
                  aria-label="Cari refund"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onStatusFilterChange(event.target.value as RefundStatusFilter)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nomor Refund</th>
                  <th>Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Jumlah</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th>Diajukan</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id}>
                    <td>
                      <b className={styles.refundId}>{refund.id}</b>
                    </td>
                    <td>
                      <code>{refund.orderId}</code>
                    </td>
                    <td>
                      <span className={styles.customer}>
                        <b>{refund.customerName}</b>
                        <small>{refund.whatsapp}</small>
                      </span>
                    </td>
                    <td className={styles.amount}>{formatRupiah(refund.amount)}</td>
                    <td>
                      <span className={styles.reason}>{refund.reason}</span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusClass(refund.status)}`}>
                        <i />
                        {refund.status}
                      </span>
                    </td>
                    <td>{formatDate(refund.requestedAt)}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => {
                          setAdminNote(refund.adminNote);
                          onView(refund);
                        }}
                        aria-label={`Tinjau refund ${refund.id}`}
                      >
                        <IconEye /> Tinjau
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRefunds.length && (
              <div className={styles.empty}>
                <IconReceipt />
                <b>Permintaan refund tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data contoh. Keputusan dan catatan refund hanya tersimpan selama halaman ini terbuka; transfer dana belum
            terhubung.
          </p>
        </Box>
      </div>
      {detailTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseDetail();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="refund-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="refund-detail-title">Tinjau Permintaan Refund</h2>
                <p>
                  {detailTarget.id} · Pesanan {detailTarget.orderId}
                </p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseDetail}>
                <IconX />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span>Pelanggan</span>
                <b>{detailTarget.customerName}</b>
              </div>
              <div>
                <span>WhatsApp</span>
                <b>{detailTarget.whatsapp}</b>
              </div>
              <div>
                <span>Game & Layanan</span>
                <b>
                  {detailTarget.game} · {detailTarget.service}
                </b>
              </div>
              <div>
                <span>Metode Pembayaran</span>
                <b>{detailTarget.paymentMethod}</b>
              </div>
              <div>
                <span>Jumlah Refund</span>
                <b className={styles.detailAmount}>{formatRupiah(detailTarget.amount)}</b>
              </div>
              <div>
                <span>Alasan Pengajuan</span>
                <b>{detailTarget.reason}</b>
              </div>
            </div>
            <label className={styles.noteLabel}>
              Catatan Admin
              <textarea
                rows={3}
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Tambahkan alasan keputusan atau catatan internal..."
              />
            </label>
            <label className={styles.statusSelect}>
              Status Permintaan
              <select
                value={detailTarget.status}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusChange(detailTarget.id, event.target.value as RefundStatus, adminNote)
                }
              >
                {statuses
                  .filter((status): status is RefundStatus => status !== 'Semua Status')
                  .map((status) => (
                    <option key={status}>{status}</option>
                  ))}
              </select>
            </label>
            <p className={styles.formNote}>
              Perubahan status ini simulasi dan tidak mengirim atau memproses pengembalian dana.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={onCloseDetail}>
                Tutup
              </button>
              <button
                className={styles.createButton}
                onClick={() => onStatusChange(detailTarget.id, detailTarget.status, adminNote)}
              >
                Simpan Catatan
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
