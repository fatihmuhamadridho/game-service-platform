'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconCreditCard, IconSearch, IconReceipt, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  TransactionMethodFilter,
  TransactionStatus,
  TransactionStatusFilter,
  TransactionView,
} from '../interfaces/admin-transaction.interface';
import styles from '../pages/AdminTransactions.module.css';

type Props = {
  transactions: TransactionView[];
  totalCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: TransactionStatusFilter;
  onStatusFilterChange: (value: TransactionStatusFilter) => void;
  methodFilter: TransactionMethodFilter;
  onMethodFilterChange: (value: TransactionMethodFilter) => void;
  detailTarget: TransactionView | null;
  onView: (transaction: TransactionView) => void;
  onCloseDetail: () => void;
  formatRupiah: (amount: number) => string;
  error?: string;
};
const statuses: TransactionStatusFilter[] = ['Semua Status', 'Berhasil', 'Menunggu', 'Gagal', 'Dikembalikan'];
const methods: TransactionMethodFilter[] = ['Semua Metode', 'QRIS', 'Transfer Bank BCA'];
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
const statusClass = (status: TransactionStatus) =>
  status === 'Berhasil'
    ? styles.statusSuccess
    : status === 'Dikembalikan'
      ? styles.statusRefunded
      : status === 'Gagal'
        ? styles.statusFailed
        : styles.statusPending;

export const AdminTransactionsTemplate = ({
  transactions,
  totalCount,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  detailTarget,
  onView,
  onCloseDetail,
  formatRupiah,
  error = '',
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const successful = transactions.filter((transaction) => transaction.status === 'Berhasil');
  const successTotal = successful.reduce((total, transaction) => total + transaction.amount, 0);
  const pendingCount = transactions.filter((transaction) => transaction.status === 'Menunggu').length;
  const refundCount = transactions.filter((transaction) => transaction.status === 'Dikembalikan').length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Transaksi" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Keuangan <span>/</span> <b>Transaksi</b>
            </p>
            <h1>Manajemen Transaksi</h1>
            <p>Pantau pembayaran pesanan dan pengembalian dana.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan transaksi">
          <Box className={styles.metric} bordered rounded>
            <span>Total Transaksi</span>
            <b>{totalCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Nilai Berhasil</span>
            <b className={styles.successValue}>{formatRupiah(successTotal)}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Menunggu</span>
            <b className={styles.warningValue}>{pendingCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Dikembalikan</span>
            <b className={styles.accentValue}>{refundCount}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Transaksi</h2>
              <small>
                {transactions.length} dari {totalCount} transaksi ditampilkan
              </small>
            </div>
            <label className={styles.search}>
              <IconSearch />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari ID transaksi, pesanan, atau pelanggan..."
                aria-label="Cari transaksi"
              />
            </label>
          </div>
          <div className={styles.filters}>
            <label className={styles.filter}>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusFilterChange(event.target.value as TransactionStatusFilter)
                }
              >
                {statuses.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className={styles.filter}>
              <span>Metode Pembayaran</span>
              <select
                value={methodFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onMethodFilterChange(event.target.value as TransactionMethodFilter)
                }
              >
                {methods.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Jenis</th>
                  <th>Metode</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Waktu</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <b className={styles.transactionId}>{transaction.id}</b>
                    </td>
                    <td>
                      <code>{transaction.orderId}</code>
                    </td>
                    <td>
                      <span className={styles.customer}>
                        <b>{transaction.customerName}</b>
                        <small>{transaction.customerContact}</small>
                      </span>
                    </td>
                    <td>{transaction.type}</td>
                    <td>
                      <span className={styles.method}>{transaction.method}</span>
                    </td>
                    <td className={styles.amount}>{formatRupiah(transaction.amount)}</td>
                    <td>
                      <span className={`${styles.status} ${statusClass(transaction.status)}`}>
                        <i />
                        {transaction.status}
                      </span>
                    </td>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => onView(transaction)}
                        aria-label={`Detail transaksi ${transaction.id}`}
                      >
                        <IconReceipt /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!transactions.length && (
              <div className={styles.empty}>
                <IconCreditCard />
                <b>Transaksi tidak ditemukan</b>
                <span>Ubah kata kunci atau filter.</span>
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className={styles.demoNote}>
              {error}
            </p>
          )}
        </Box>
      </div>
      {detailTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseDetail();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="transaction-detail-title">Detail Transaksi</h2>
                <p>{detailTarget.id}</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseDetail}>
                <IconX />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span>Nomor Pesanan</span>
                <b>{detailTarget.orderId}</b>
              </div>
              <div>
                <span>Pelanggan</span>
                <b>
                  {detailTarget.customerName} · {detailTarget.customerContact}
                </b>
              </div>
              <div>
                <span>Jenis Transaksi</span>
                <b>{detailTarget.type}</b>
              </div>
              <div>
                <span>Metode Pembayaran</span>
                <b>{detailTarget.method}</b>
              </div>
              <div>
                <span>Referensi Provider</span>
                <b>{detailTarget.providerReference}</b>
              </div>
              <div>
                <span>Status</span>
                <b className={statusClass(detailTarget.status)}>{detailTarget.status}</b>
              </div>
              <div>
                <span>Dibuat</span>
                <b>{formatDate(detailTarget.createdAt)}</b>
              </div>
              <div>
                <span>Diselesaikan</span>
                <b>{formatDate(detailTarget.settledAt)}</b>
              </div>
            </div>
            <div className={styles.total}>
              <span>Jumlah Transaksi</span>
              <b>{formatRupiah(detailTarget.amount)}</b>
            </div>
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
