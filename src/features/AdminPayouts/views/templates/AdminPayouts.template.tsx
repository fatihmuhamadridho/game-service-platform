'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconBuildingBank, IconEye, IconSearch, IconWallet, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type { PayoutStatus, PayoutStatusFilter, PayoutView } from '../interfaces/admin-payout.interface';
import styles from '../pages/AdminPayouts.module.css';

type Props = {
  payouts: PayoutView[];
  filteredPayouts: PayoutView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: PayoutStatusFilter;
  onStatusFilterChange: (value: PayoutStatusFilter) => void;
  detailTarget: PayoutView | null;
  onView: (payout: PayoutView) => void;
  onCloseDetail: () => void;
  onStatusChange: (id: string, status: PayoutStatus) => void;
  formatRupiah: (amount: number) => string;
};
const statuses: PayoutStatusFilter[] = ['Semua Status', 'Menunggu Review', 'Diproses', 'Berhasil', 'Ditolak'];
const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
const statusClass = (status: PayoutStatus) =>
  status === 'Berhasil'
    ? styles.statusSuccess
    : status === 'Ditolak'
      ? styles.statusFailed
      : status === 'Diproses'
        ? styles.statusProcessing
        : styles.statusPending;

export const AdminPayoutsTemplate = ({
  payouts,
  filteredPayouts,
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
  const waitingCount = payouts.filter((payout) => payout.status === 'Menunggu Review').length;
  const processingCount = payouts.filter((payout) => payout.status === 'Diproses').length;
  const completedTotal = payouts
    .filter((payout) => payout.status === 'Berhasil')
    .reduce((sum, payout) => sum + payout.amount, 0);
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Payout" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Keuangan <span>/</span> <b>Payout</b>
            </p>
            <h1>Manajemen Payout</h1>
            <p>Tinjau permintaan pencairan saldo partner dan catat statusnya.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan payout">
          <Box className={styles.metric} bordered rounded>
            <span>Total Payout</span>
            <b>{payouts.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Menunggu Review</span>
            <b className={styles.warningValue}>{waitingCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Sedang Diproses</span>
            <b className={styles.accentValue}>{processingCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Total Berhasil</span>
            <b className={styles.successValue}>{formatRupiah(completedTotal)}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Permintaan Payout</h2>
              <small>
                {filteredPayouts.length} dari {payouts.length} permintaan ditampilkan
              </small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari ID, partner, atau referensi..."
                  aria-label="Cari payout"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onStatusFilterChange(event.target.value as PayoutStatusFilter)
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
                  <th>ID Payout</th>
                  <th>Partner</th>
                  <th>Rekening Tujuan</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Diajukan</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id}>
                    <td>
                      <b className={styles.payoutId}>{payout.id}</b>
                      <small className={styles.reference}>{payout.reference}</small>
                    </td>
                    <td>
                      <span className={styles.partner}>
                        <b>{payout.partnerName}</b>
                        <small>{payout.partnerContact}</small>
                      </span>
                    </td>
                    <td>
                      <span className={styles.account}>
                        <b>
                          {payout.bankName} · {payout.accountNumber}
                        </b>
                        <small>{payout.accountHolder}</small>
                      </span>
                    </td>
                    <td className={styles.amount}>{formatRupiah(payout.amount)}</td>
                    <td>
                      <span className={`${styles.status} ${statusClass(payout.status)}`}>
                        <i />
                        {payout.status}
                      </span>
                    </td>
                    <td>{formatDate(payout.requestedAt)}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => onView(payout)}
                        aria-label={`Detail payout ${payout.id}`}
                      >
                        <IconEye /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredPayouts.length && (
              <div className={styles.empty}>
                <IconWallet />
                <b>Permintaan payout tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data contoh. Status tidak memicu transfer bank dan hanya tersimpan selama halaman ini terbuka.
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="payout-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="payout-detail-title">Detail Payout</h2>
                <p>{detailTarget.id}</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseDetail}>
                <IconX />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span>Partner</span>
                <b>
                  {detailTarget.partnerName} · {detailTarget.partnerContact}
                </b>
              </div>
              <div>
                <span>Referensi</span>
                <b>{detailTarget.reference}</b>
              </div>
              <div>
                <span>Bank</span>
                <b>{detailTarget.bankName}</b>
              </div>
              <div>
                <span>Nomor Rekening</span>
                <b>{detailTarget.accountNumber}</b>
              </div>
              <div>
                <span>Nama Pemilik</span>
                <b>{detailTarget.accountHolder}</b>
              </div>
              <div>
                <span>Catatan</span>
                <b>{detailTarget.note || 'Tidak ada catatan.'}</b>
              </div>
              <div>
                <span>Diajukan</span>
                <b>{formatDate(detailTarget.requestedAt)}</b>
              </div>
              <div>
                <span>Diproses</span>
                <b>{formatDate(detailTarget.processedAt)}</b>
              </div>
            </div>
            <div className={styles.total}>
              <span>Jumlah Payout</span>
              <b>{formatRupiah(detailTarget.amount)}</b>
            </div>
            <label className={styles.statusSelect}>
              Status Payout
              <select
                value={detailTarget.status}
                onChange={(event) => onStatusChange(detailTarget.id, event.target.value as PayoutStatus)}
              >
                {statuses
                  .filter((status): status is PayoutStatus => status !== 'Semua Status')
                  .map((status) => (
                    <option key={status}>{status}</option>
                  ))}
              </select>
            </label>
            <p className={styles.formNote}>
              Simulasi UI. Verifikasi rekening dan lakukan transfer lewat prosedur keuangan sebelum mencatat hasil.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.createButton} onClick={onCloseDetail}>
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
