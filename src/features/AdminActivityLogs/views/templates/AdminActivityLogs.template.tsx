'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconActivity, IconCalendar, IconSearch, IconShieldCheck } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type { ActivityCategory, ActivityLogView } from '../interfaces/admin-activity-log.interface';
import styles from '../pages/AdminActivityLogs.module.css';

type Props = {
  logs: ActivityLogView[];
  totalCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  category: ActivityCategory;
  onCategoryChange: (value: ActivityCategory) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
};
const categories: ActivityCategory[] = ['Semua Kategori', 'Pesanan', 'Produk', 'Pengguna', 'Konten', 'Pengaturan'];
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const AdminActivityLogsTemplate = ({
  logs,
  totalCount,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Log Aktivitas" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengaturan <span>/</span> <b>Log Aktivitas</b>
            </p>
            <h1>Log Aktivitas</h1>
            <p>Pantau aktivitas admin dan perubahan yang dilakukan di dashboard.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan aktivitas">
          <Box className={styles.metric} bordered rounded>
            <span>Total Aktivitas</span>
            <b>{totalCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Hasil Filter</span>
            <b className={styles.accentValue}>{logs.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Berhasil</span>
            <b className={styles.successValue}>{logs.filter((log) => log.result === 'Berhasil').length}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Riwayat Aktivitas</h2>
              <small>
                {logs.length} dari {totalCount} aktivitas ditampilkan
              </small>
            </div>
            <label className={styles.search}>
              <IconSearch />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari admin, aksi, atau target..."
                aria-label="Cari aktivitas"
              />
            </label>
          </div>
          <div className={styles.filters}>
            <label className={styles.filter}>
              <span>Kategori</span>
              <select
                value={category}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onCategoryChange(event.target.value as ActivityCategory)
                }
              >
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className={styles.filter}>
              <span>Dari tanggal</span>
              <span className={styles.dateInput}>
                <IconCalendar />
                <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
              </span>
            </label>
            <label className={styles.filter}>
              <span>Sampai tanggal</span>
              <span className={styles.dateInput}>
                <IconCalendar />
                <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
              </span>
            </label>
            <button
              className={styles.clearButton}
              onClick={() => {
                onCategoryChange('Semua Kategori');
                onDateFromChange('');
                onDateToChange('');
                onQueryChange('');
              }}
            >
              Reset Filter
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Aktivitas</th>
                  <th>Admin</th>
                  <th>Kategori</th>
                  <th>Waktu</th>
                  <th>IP Address</th>
                  <th>Hasil</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={styles.activityCell}>
                        <i>
                          <IconActivity />
                        </i>
                        <span>
                          <b>{log.action}</b>
                          <small>{log.target}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.adminCell}>
                        <b>{log.adminName}</b>
                        <small>{log.adminEmail}</small>
                      </span>
                    </td>
                    <td>
                      <span className={styles.category}>{log.category}</span>
                    </td>
                    <td>{formatDate(log.occurredAt)}</td>
                    <td>
                      <code>{log.ipAddress}</code>
                    </td>
                    <td>
                      <span
                        className={`${styles.result} ${log.result === 'Berhasil' ? styles.resultSuccess : styles.resultFailed}`}
                      >
                        <i />
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!logs.length && (
              <div className={styles.empty}>
                <IconShieldCheck />
                <b>Aktivitas tidak ditemukan</b>
                <span>Ubah pencarian atau filter tanggal.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Log contoh untuk pratinjau UI. IP menggunakan alamat dokumentasi dan tidak merepresentasikan admin asli.
          </p>
        </Box>
      </div>
    </main>
  );
};
