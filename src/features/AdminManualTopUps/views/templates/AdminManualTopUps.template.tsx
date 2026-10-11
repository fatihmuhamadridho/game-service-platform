'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEye, IconSearch, IconWallet, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  ManualTopUpStatus,
  ManualTopUpStatusFilter,
  ManualTopUpView,
} from '../interfaces/admin-manual-top-up.interface';
import styles from '../pages/AdminManualTopUps.module.css';

type Props = {
  requests: ManualTopUpView[];
  filteredRequests: ManualTopUpView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: ManualTopUpStatusFilter;
  onStatusFilterChange: (value: ManualTopUpStatusFilter) => void;
  detailTarget: ManualTopUpView | null;
  onView: (request: ManualTopUpView) => void;
  onCloseDetail: () => void;
  onStatusChange: (id: string, status: ManualTopUpStatus) => void;
  formatRupiah: (amount: number) => string;
};
const statuses: ManualTopUpStatusFilter[] = ['Semua Status', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const statusClass = (status: ManualTopUpStatus) =>
  status === 'Selesai'
    ? styles.statusDone
    : status === 'Ditolak'
      ? styles.statusRejected
      : status === 'Diproses'
        ? styles.statusProcessing
        : styles.statusWaiting;

export const AdminManualTopUpsTemplate = ({
  requests,
  filteredRequests,
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
  const count = (status: ManualTopUpStatus) => requests.filter((request) => request.status === status).length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Top Up Manual" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Order <span>/</span> <b>Top Up Manual</b>
            </p>
            <h1>Top Up Manual</h1>
            <p>Verifikasi dan kelola permintaan top up yang diproses manual.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan top up manual">
          <Box className={styles.metric} bordered rounded>
            <span>Total Permintaan</span>
            <b>{requests.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Menunggu</span>
            <b className={styles.warningValue}>{count('Menunggu')}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Diproses</span>
            <b className={styles.accentValue}>{count('Diproses')}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Selesai</span>
            <b className={styles.successValue}>{count('Selesai')}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Permintaan Top Up</h2>
              <small>
                {filteredRequests.length} dari {requests.length} permintaan ditampilkan
              </small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nomor, pelanggan, atau game..."
                  aria-label="Cari permintaan top up"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onStatusFilterChange(event.target.value as ManualTopUpStatusFilter)
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
                  <th>Nomor</th>
                  <th>Pelanggan</th>
                  <th>Game & Paket</th>
                  <th>Jumlah</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <b className={styles.requestId}>{request.id}</b>
                    </td>
                    <td>
                      <span className={styles.customer}>
                        <b>{request.customerName}</b>
                        <small>{request.whatsapp}</small>
                      </span>
                    </td>
                    <td>
                      <span className={styles.gamePackage}>
                        <b>{request.game}</b>
                        <small>{request.packageName}</small>
                      </span>
                    </td>
                    <td className={styles.amount}>{formatRupiah(request.amount)}</td>
                    <td>
                      <span className={styles.payment}>
                        <b>{request.paymentMethod}</b>
                        <small>{request.paymentReference}</small>
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusClass(request.status)}`}>
                        <i />
                        {request.status}
                      </span>
                    </td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => onView(request)}
                        aria-label={`Lihat permintaan ${request.id}`}
                      >
                        <IconEye /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRequests.length && (
              <div className={styles.empty}>
                <IconWallet />
                <b>Permintaan tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data contoh. Perubahan status hanya tersimpan selama halaman ini terbuka; bukti pembayaran belum terhubung.
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="topup-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="topup-detail-title">Detail Top Up Manual</h2>
                <p>{detailTarget.id}</p>
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
                <span>Game</span>
                <b>{detailTarget.game}</b>
              </div>
              <div>
                <span>Paket</span>
                <b>{detailTarget.packageName}</b>
              </div>
              <div>
                <span>Username / User ID</span>
                <b>{detailTarget.accountId}</b>
              </div>
              <div>
                <span>Server</span>
                <b>{detailTarget.server}</b>
              </div>
              <div>
                <span>Metode Pembayaran</span>
                <b>{detailTarget.paymentMethod}</b>
              </div>
              <div>
                <span>Referensi Pembayaran</span>
                <b>{detailTarget.paymentReference}</b>
              </div>
              <div>
                <span>Jumlah</span>
                <b className={styles.detailAmount}>{formatRupiah(detailTarget.amount)}</b>
              </div>
              <div className={styles.noteField}>
                <span>Catatan Pelanggan</span>
                <b>{detailTarget.notes || 'Tidak ada catatan.'}</b>
              </div>
            </div>
            <label className={styles.statusSelect}>
              Status Permintaan
              <select
                value={detailTarget.status}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusChange(detailTarget.id, event.target.value as ManualTopUpStatus)
                }
              >
                {statuses
                  .filter((status): status is ManualTopUpStatus => status !== 'Semua Status')
                  .map((status) => (
                    <option key={status}>{status}</option>
                  ))}
              </select>
            </label>
            <p className={styles.formNote}>
              Simulasi UI. Pastikan verifikasi pembayaran dan pengisian dilakukan melalui prosedur admin sebelum
              mengubah status.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.createButton} onClick={onCloseDetail}>
                Selesai
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
