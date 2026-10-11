'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminFaqForm, AdminFaqStatusFilter, AdminFaqView } from '../interfaces/admin-faq.interface';
import { AdminFaqsTemplate } from '../templates/AdminFaqs.template';

const seedFaqs: AdminFaqView[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara membuat pesanan?',
    answer: 'Pilih game dan layanan, isi detail pesanan, lalu lanjutkan ke pembayaran.',
    category: 'Pemesanan',
    status: 'Published',
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'faq-2',
    question: 'Metode pembayaran apa yang tersedia?',
    answer: 'Metode pembayaran yang tersedia ditampilkan pada langkah pembayaran.',
    category: 'Pembayaran',
    status: 'Published',
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana cara melacak pesanan?',
    answer: 'Gunakan halaman Cek Pesanan dengan nomor pesanan dan nomor WhatsApp yang digunakan.',
    category: 'Pesanan',
    status: 'Draft',
    updatedAt: '8 Okt 2026',
  },
];
const emptyForm: AdminFaqForm = { question: '', answer: '', category: 'Umum', status: 'Draft' };

export const AdminFaqsPage = () => {
  const [faqs, setFaqs] = useState(seedFaqs);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminFaqStatusFilter>('Semua Status');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminFaqForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaqView | null>(null);
  const filteredFaqs = useMemo(
    () =>
      faqs.filter(
        (faq) =>
          `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || faq.status === statusFilter)
      ),
    [faqs, query, statusFilter]
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };
  const openEdit = (faq: AdminFaqView) => {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, status: faq.status });
    setFormMode('edit');
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = {
      ...form,
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim(),
      updatedAt: 'Baru saja',
    };
    if (formMode === 'edit' && editingId)
      setFaqs((current) => current.map((faq) => (faq.id === editingId ? { ...faq, ...next } : faq)));
    else setFaqs((current) => [{ id: `faq-${Date.now()}`, ...next }, ...current]);
    setFormMode(null);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setFaqs((current) => current.filter((faq) => faq.id !== deleteTarget.id));
    setDeleteTarget(null);
  };
  return (
    <AdminFaqsTemplate
      faqs={faqs}
      filteredFaqs={filteredFaqs}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      publishedCount={faqs.filter((faq) => faq.status === 'Published').length}
      formMode={formMode}
      form={form}
      onFormChange={setForm}
      onCreate={openCreate}
      onEdit={openEdit}
      onSave={handleSave}
      onCloseForm={() => setFormMode(null)}
      deleteTarget={deleteTarget}
      onDeleteSelect={setDeleteTarget}
      onDeleteConfirm={confirmDelete}
    />
  );
};
