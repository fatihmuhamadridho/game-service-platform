'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  ComplaintMessage,
  ComplaintPriorityFilter,
  ComplaintStatus,
  ComplaintStatusFilter,
  ComplaintView,
} from '../interfaces/admin-complaint.interface';
import { AdminComplaintsTemplate } from '../templates/AdminComplaints.template';

const seedComplaints: ComplaintView[] = [
  {
    id: 'CP-2026-00083',
    orderId: 'JH-2026-001238',
    customerName: 'Alya Putri',
    whatsapp: '+6281234567890',
    subject: 'Diamond belum masuk',
    category: 'Pesanan',
    priority: 'Tinggi',
    status: 'Baru',
    createdAt: '2026-10-11T10:20:00',
    messages: [
      {
        id: 'm1',
        sender: 'Alya Putri',
        role: 'Pengguna',
        message: 'Pembayaran sudah berhasil, tapi diamond belum masuk ke akun saya.',
        sentAt: '2026-10-11T10:20:00',
      },
      {
        id: 'm2',
        sender: 'Alya Putri',
        role: 'Pengguna',
        message: 'Nomor pesanan JH-2026-001238.',
        sentAt: '2026-10-11T10:22:00',
      },
    ],
  },
  {
    id: 'CP-2026-00082',
    orderId: 'JH-2026-001219',
    customerName: 'Rizky A',
    whatsapp: '+6282234567890',
    subject: 'Estimasi layanan',
    category: 'Layanan',
    priority: 'Normal',
    status: 'Diproses',
    createdAt: '2026-10-11T08:45:00',
    messages: [
      {
        id: 'm3',
        sender: 'Rizky A',
        role: 'Pengguna',
        message: 'Saya ingin menanyakan estimasi pengerjaan pesanan.',
        sentAt: '2026-10-11T08:45:00',
      },
      {
        id: 'm4',
        sender: 'Admin Nadia',
        role: 'Admin',
        message: 'Pesanan sedang kami cek. Kami kabari melalui chat ini.',
        sentAt: '2026-10-11T09:10:00',
      },
    ],
  },
  {
    id: 'CP-2026-00081',
    orderId: 'JH-2026-001202',
    customerName: 'Indah Putri',
    whatsapp: '+6281334567890',
    subject: 'Salah pilih server',
    category: 'Akun Game',
    priority: 'Rendah',
    status: 'Menunggu Pengguna',
    createdAt: '2026-10-10T16:12:00',
    messages: [
      {
        id: 'm5',
        sender: 'Indah Putri',
        role: 'Pengguna',
        message: 'Sepertinya saya salah memilih server saat mengisi detail.',
        sentAt: '2026-10-10T16:12:00',
      },
      {
        id: 'm6',
        sender: 'Admin Dewi',
        role: 'Admin',
        message: 'Mohon kirim server yang benar agar kami bantu cek.',
        sentAt: '2026-10-10T16:40:00',
      },
    ],
  },
  {
    id: 'CP-2026-00080',
    orderId: 'JH-2026-001188',
    customerName: 'Dimas Aja',
    whatsapp: '+6287734567890',
    subject: 'Konfirmasi pesanan selesai',
    category: 'Pesanan',
    priority: 'Normal',
    status: 'Selesai',
    createdAt: '2026-10-09T09:30:00',
    messages: [
      {
        id: 'm7',
        sender: 'Dimas Aja',
        role: 'Pengguna',
        message: 'Pesanan sudah saya terima, terima kasih.',
        sentAt: '2026-10-09T09:30:00',
      },
      {
        id: 'm8',
        sender: 'Admin Nadia',
        role: 'Admin',
        message: 'Sama-sama. Tiket kami tutup.',
        sentAt: '2026-10-09T10:00:00',
      },
    ],
  },
];

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState(seedComplaints);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatusFilter>('Semua Status');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriorityFilter>('Semua Prioritas');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const filteredComplaints = useMemo(
    () =>
      complaints.filter(
        (item) =>
          `${item.id} ${item.orderId} ${item.customerName} ${item.subject} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || item.status === statusFilter) &&
          (priorityFilter === 'Semua Prioritas' || item.priority === priorityFilter)
      ),
    [complaints, query, statusFilter, priorityFilter]
  );
  const activeComplaint = complaints.find((item) => item.id === detailId) ?? null;
  const changeStatus = (id: string, status: ComplaintStatus) =>
    setComplaints((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  const sendReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeComplaint || !reply.trim()) return;
    const message: ComplaintMessage = {
      id: `reply-${Date.now()}`,
      sender: 'Admin',
      role: 'Admin',
      message: reply.trim(),
      sentAt: new Date().toISOString(),
    };
    setComplaints((current) =>
      current.map((item) =>
        item.id === activeComplaint.id
          ? {
              ...item,
              messages: [...item.messages, message],
              status: item.status === 'Baru' ? 'Diproses' : item.status,
            }
          : item
      )
    );
    setReply('');
  };
  return (
    <AdminComplaintsTemplate
      complaints={filteredComplaints}
      allComplaints={complaints}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      priorityFilter={priorityFilter}
      onPriorityFilterChange={setPriorityFilter}
      activeComplaint={activeComplaint}
      onOpenComplaint={(item) => {
        setDetailId(item.id);
        setReply('');
      }}
      onCloseComplaint={() => setDetailId(null)}
      onStatusChange={changeStatus}
      reply={reply}
      onReplyChange={setReply}
      onSendReply={sendReply}
    />
  );
};
