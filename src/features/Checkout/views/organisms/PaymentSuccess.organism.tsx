import Link from 'next/link';
import { IconCircleCheck, IconClock, IconHome, IconRefresh, IconX } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import styles from './PaymentSuccess.module.css';

type Props = {
  orderNumber: string;
  game: string;
  service: CheckoutService;
  total: number;
  formatPrice: (value: number) => string;
  paymentStatus: 'PENDING_REVIEW' | 'PAID' | 'UNPAID' | 'FAILED';
  reviewNote: string;
  retryAllowed: boolean;
  onResubmit: () => void;
};

export const PaymentSuccess = ({
  orderNumber,
  game,
  service,
  total,
  formatPrice,
  paymentStatus,
  reviewNote,
  retryAllowed,
  onResubmit,
}: Props) => {
  const rejected = paymentStatus === 'UNPAID';
  const paid = paymentStatus === 'PAID';
  const expired = paymentStatus === 'FAILED';
  const title = paid
    ? 'Pembayaran Terverifikasi'
    : rejected
      ? 'Bukti Perlu Diperbaiki'
      : expired
        ? 'Pembayaran Ditolak'
        : 'Menunggu Verifikasi';
  return (
    <section className={styles.container} aria-labelledby="payment-success-title">
      <div className={styles.card}>
        <span className={styles.icon}>
          {paid ? (
            <IconCircleCheck aria-hidden="true" />
          ) : rejected ? (
            <IconRefresh aria-hidden="true" />
          ) : expired ? (
            <IconX aria-hidden="true" />
          ) : (
            <IconClock aria-hidden="true" />
          )}
        </span>
        <p className={styles.eyebrow}>
          {paid
            ? 'Pembayaran berhasil diperiksa'
            : rejected
              ? 'Admin meminta bukti baru'
              : expired
                ? 'Pesanan tidak dapat dibayar'
                : 'Bukti pembayaran diterima'}
        </p>
        <h1 id="payment-success-title">{title}</h1>
        <p className={styles.description}>
          {paid
            ? `Pembayaran pesanan ${orderNumber} sudah disetujui admin.`
            : rejected
              ? `Bukti untuk pesanan ${orderNumber} ditolak. ${reviewNote || 'Periksa catatan admin, lalu unggah bukti yang benar.'}`
              : expired
                ? `Pembayaran pesanan ${orderNumber} ditolak setelah batas waktu. Buat pesanan baru untuk melanjutkan.`
                : `Bukti untuk pesanan ${orderNumber} tersimpan. Pesanan belum lunas sampai admin menyetujui pembayaran.`}
        </p>
        <div className={styles.status}>
          {paid ? <IconCircleCheck aria-hidden="true" /> : <IconClock aria-hidden="true" />}
          <span>
            {paid
              ? 'Pembayaran terverifikasi'
              : rejected
                ? 'Menunggu bukti pembayaran baru'
                : expired
                  ? 'Pesanan kedaluwarsa'
                  : 'Menunggu pemeriksaan admin'}
          </span>
        </div>
        {rejected && retryAllowed && (
          <button className={styles.backButton} type="button" onClick={onResubmit}>
            <IconRefresh aria-hidden="true" /> Kirim Ulang Bukti
          </button>
        )}
        <dl className={styles.summary}>
          <div>
            <dt>Game</dt>
            <dd>{game}</dd>
          </div>
          <div>
            <dt>Layanan</dt>
            <dd>{service.name}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <Link className={styles.backButton} href="/">
          <IconHome aria-hidden="true" /> Kembali ke beranda
        </Link>
      </div>
    </section>
  );
};
