'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEye, IconFileText, IconSearch, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type { AdminOrderStatus, AdminOrderStatusFilter, AdminOrderView } from '../interfaces/admin-order.interface';
import styles from '../pages/AdminOrders.module.css';

type Props = {
  orders: AdminOrderView[];
  filteredOrders: AdminOrderView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminOrderStatusFilter;
  onStatusFilterChange: (value: AdminOrderStatusFilter) => void;
  onView: (order: AdminOrderView) => void;
  onStatusChange: (id: string, status: AdminOrderStatus) => void;
  formatRupiah: (amount: number) => string;
  detailOrder: AdminOrderView | null;
  onCloseDetail: () => void;
};
const statuses: AdminOrderStatusFilter[] = [
  'Semua Status',
  'Menunggu Pembayaran',
  'Menunggu Validasi',
  'Diproses',
  'Selesai',
  'Dibatalkan',
];
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const statusClass = (status: AdminOrderStatus) =>
  status === 'Selesai'
    ? styles.statusDone
    : status === 'Dibatalkan'
      ? styles.statusCancelled
      : status === 'Diproses'
        ? styles.statusProcessing
        : styles.statusWaiting;

export const AdminOrdersTemplate = ({
  orders,
  filteredOrders,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onView,
  onStatusChange,
  formatRupiah,
  detailOrder,
  onCloseDetail,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const count = (status: AdminOrderStatus) => orders.filter((order) => order.status === status).length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Pesanan" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Order <span>/</span> <b>Pesanan</b>
            </p>
            <h1>Manajemen Pesanan</h1>
            <p>Pantau detail pesanan dan perbarui status prosesnya.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan pesanan">
          <Box className={styles.metric} bordered rounded>
            <span>Total Pesanan</span>
            <b>{orders.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Perlu Tindakan</span>
            <b className={styles.warningValue}>{count('Menunggu Validasi') + count('Menunggu Pembayaran')}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Dalam Proses</span>
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
              <h2>Daftar Pesanan</h2>
              <small>
                {filteredOrders.length} dari {orders.length} pesanan ditampilkan
              </small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nomor, nama, atau game..."
                  aria-label="Cari pesanan"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onStatusFilterChange(event.target.value as AdminOrderStatusFilter)
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
                  <th>Nomor Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Game & Layanan</th>
                  <th>Total</th>
                  <th>Pembayaran</th>
                  <th>Status Pesanan</th>
                  <th>Tanggal</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <b className={styles.orderId}>{order.id}</b>
                    </td>
                    <td>
                      <span className={styles.customer}>
                        <b>{order.customerName}</b>
                        <small>{order.whatsapp}</small>
                      </span>
                    </td>
                    <td>
                      <span className={styles.gameService}>
                        <b>{order.game}</b>
                        <small>{order.service}</small>
                      </span>
                    </td>
                    <td className={styles.amount}>{formatRupiah(order.amount)}</td>
                    <td>
                      <span className={styles.payment}>
                        <b>{order.paymentMethod}</b>
                        <small>{order.paymentStatus}</small>
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusClass(order.status)}`}>
                        <i />
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => onView(order)}
                        aria-label={`Lihat pesanan ${order.id}`}
                      >
                        <IconEye /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredOrders.length && (
              <div className={styles.empty}>
                <IconFileText />
                <b>Pesanan tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data pesanan contoh. Perubahan status hanya tersimpan selama halaman ini terbuka.
          </p>
        </Box>
      </div>
      {detailOrder && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseDetail();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="order-detail-title">Detail Pesanan</h2>
                <p>{detailOrder.id}</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseDetail}>
                <IconX />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span>Pelanggan</span>
                <b>{detailOrder.customerName}</b>
              </div>
              <div>
                <span>WhatsApp</span>
                <b>{detailOrder.whatsapp}</b>
              </div>
              <div>
                <span>Game</span>
                <b>{detailOrder.game}</b>
              </div>
              <div>
                <span>Layanan</span>
                <b>{detailOrder.service}</b>
              </div>
              <div>
                <span>Username / User ID</span>
                <b>{detailOrder.gameAccount}</b>
              </div>
              <div>
                <span>Server</span>
                <b>{detailOrder.server}</b>
              </div>
              <div>
                <span>Pembayaran</span>
                <b>
                  {detailOrder.paymentMethod} · {detailOrder.paymentStatus}
                </b>
              </div>
              <div>
                <span>Total</span>
                <b className={styles.detailAmount}>{formatRupiah(detailOrder.amount)}</b>
              </div>
            </div>
            <label className={styles.statusSelect}>
              Status Pesanan
              <select
                value={detailOrder.status}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusChange(detailOrder.id, event.target.value as AdminOrderStatus)
                }
              >
                {statuses
                  .filter((status): status is AdminOrderStatus => status !== 'Semua Status')
                  .map((status) => (
                    <option key={status}>{status}</option>
                  ))}
              </select>
            </label>
            <p className={styles.formNote}>
              Simulasi UI. Perubahan status belum tersimpan ke backend atau memicu notifikasi.
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
