'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconMessageCircle, IconSearch, IconSend, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  ComplaintPriorityFilter,
  ComplaintStatus,
  ComplaintStatusFilter,
  ComplaintView,
} from '../interfaces/admin-complaint.interface';
import styles from '../pages/AdminComplaints.module.css';

type Props = {
  complaints: ComplaintView[];
  allComplaints: ComplaintView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: ComplaintStatusFilter;
  onStatusFilterChange: (value: ComplaintStatusFilter) => void;
  priorityFilter: ComplaintPriorityFilter;
  onPriorityFilterChange: (value: ComplaintPriorityFilter) => void;
  activeComplaint: ComplaintView | null;
  onOpenComplaint: (item: ComplaintView) => void;
  onCloseComplaint: () => void;
  onStatusChange: (id: string, status: ComplaintStatus) => void;
  reply: string;
  onReplyChange: (value: string) => void;
  onSendReply: (event: FormEvent<HTMLFormElement>) => void;
};
const statuses: ComplaintStatusFilter[] = ['Semua Status', 'Baru', 'Diproses', 'Menunggu Pengguna', 'Selesai'];
const priorities: ComplaintPriorityFilter[] = ['Semua Prioritas', 'Rendah', 'Normal', 'Tinggi', 'Urgent'];
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const statusClass = (status: ComplaintStatus) =>
  status === 'Selesai'
    ? styles.statusDone
    : status === 'Diproses'
      ? styles.statusProcessing
      : status === 'Menunggu Pengguna'
        ? styles.statusUser
        : styles.statusNew;
const priorityClass = (priority: string) =>
  priority === 'Urgent' || priority === 'Tinggi'
    ? styles.priorityHigh
    : priority === 'Rendah'
      ? styles.priorityLow
      : styles.priorityNormal;

export const AdminComplaintsTemplate = ({
  complaints,
  allComplaints,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  activeComplaint,
  onOpenComplaint,
  onCloseComplaint,
  onStatusChange,
  reply,
  onReplyChange,
  onSendReply,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const newCount = allComplaints.filter((item) => item.status === 'Baru').length;
  const inProgressCount = allComplaints.filter((item) => item.status === 'Diproses').length;
  const urgentCount = allComplaints.filter((item) => item.priority === 'Urgent' || item.priority === 'Tinggi').length;
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Komplain" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Order <span>/</span> <b>Komplain</b>
            </p>
            <h1>Manajemen Komplain</h1>
            <p>Tinjau tiket bantuan dan tangani percakapan pelanggan.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan komplain">
          <Box className={styles.metric} bordered rounded>
            <span>Total Tiket</span>
            <b>{allComplaints.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Tiket Baru</span>
            <b className={styles.warningValue}>{newCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Sedang Diproses</span>
            <b className={styles.accentValue}>{inProgressCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Prioritas Tinggi</span>
            <b className={styles.dangerValue}>{urgentCount}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Komplain</h2>
              <small>
                {complaints.length} dari {allComplaints.length} tiket ditampilkan
              </small>
            </div>
            <label className={styles.search}>
              <IconSearch />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari tiket, pelanggan, atau pesanan..."
                aria-label="Cari komplain"
              />
            </label>
          </div>
          <div className={styles.filters}>
            <label className={styles.filter}>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusFilterChange(event.target.value as ComplaintStatusFilter)
                }
              >
                {statuses.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className={styles.filter}>
              <span>Prioritas</span>
              <select
                value={priorityFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onPriorityFilterChange(event.target.value as ComplaintPriorityFilter)
                }
              >
                {priorities.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Tiket & Subjek</th>
                  <th>Pelanggan</th>
                  <th>Pesanan</th>
                  <th>Prioritas</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.ticketCell}>
                        <i>
                          <IconMessageCircle />
                        </i>
                        <span>
                          <b>{item.subject}</b>
                          <small>
                            {item.id} · {item.category}
                          </small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.customer}>
                        <b>{item.customerName}</b>
                        <small>{item.whatsapp}</small>
                      </span>
                    </td>
                    <td>
                      <code>{item.orderId}</code>
                    </td>
                    <td>
                      <span className={`${styles.priority} ${priorityClass(item.priority)}`}>{item.priority}</span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusClass(item.status)}`}>
                        <i />
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button className={styles.detailButton} onClick={() => onOpenComplaint(item)}>
                        Buka Tiket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!complaints.length && (
              <div className={styles.empty}>
                <IconMessageCircle />
                <b>Komplain tidak ditemukan</b>
                <span>Coba ubah pencarian atau filter.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Data contoh. Balasan dan perubahan status hanya tersimpan selama halaman ini terbuka.
          </p>
        </Box>
      </div>
      {activeComplaint && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseComplaint();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="complaint-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="complaint-detail-title">{activeComplaint.subject}</h2>
                <p>
                  {activeComplaint.id} · {activeComplaint.customerName} · {activeComplaint.orderId}
                </p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseComplaint}>
                <IconX />
              </button>
            </div>
            <div className={styles.ticketMeta}>
              <span className={`${styles.priority} ${priorityClass(activeComplaint.priority)}`}>
                {activeComplaint.priority}
              </span>
              <label>
                Status
                <select
                  value={activeComplaint.status}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onStatusChange(activeComplaint.id, event.target.value as ComplaintStatus)
                  }
                >
                  {statuses
                    .filter((status): status is ComplaintStatus => status !== 'Semua Status')
                    .map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                </select>
              </label>
            </div>
            <div className={styles.messages}>
              {activeComplaint.messages.map((message) => (
                <article
                  className={message.role === 'Admin' ? styles.adminMessage : styles.userMessage}
                  key={message.id}
                >
                  <div>
                    <b>{message.sender}</b>
                    <small>
                      {message.role} · {formatDate(message.sentAt)}
                    </small>
                  </div>
                  <p>{message.message}</p>
                </article>
              ))}
            </div>
            <form className={styles.replyForm} onSubmit={onSendReply}>
              <label htmlFor="complaint-reply">Balas pelanggan</label>
              <textarea
                id="complaint-reply"
                required
                rows={3}
                value={reply}
                onChange={(event) => onReplyChange(event.target.value)}
                placeholder="Tulis balasan..."
              />
              <button className={styles.createButton} type="submit">
                <IconSend /> Kirim Balasan
              </button>
            </form>
            <p className={styles.formNote}>Simulasi UI. Balasan tidak dikirim ke WhatsApp atau server.</p>
          </section>
        </div>
      )}
    </main>
  );
};
