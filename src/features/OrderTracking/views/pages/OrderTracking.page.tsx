'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button } from 'rangkaui';
import {
  IconArrowRight,
  IconClipboardCheck,
  IconHeadset,
  IconSearch,
  IconShieldCheck,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { Header } from '@common-ui/organisms/Header/Header';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import styles from './OrderTracking.module.css';

export const OrderTrackingPage = ({
  initialOrderNumber = '',
  returnTo = '',
}: {
  initialOrderNumber?: string;
  returnTo?: string;
}) => {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = [!orderId.trim() ? 'orderId' : '', !phone.trim() ? 'phone' : ''].filter(Boolean);
    setErrors(missing);
    if (missing.length) return;
    setSubmitting(true);
    setApiError('');
    try {
      const normalizedOrder = orderId.trim().toUpperCase();
      const response = await fetch('/api/orders/v1/tracking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: normalizedOrder, whatsapp: phone.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.data) throw new Error(result.status?.message ?? 'Pesanan tidak dapat diverifikasi.');
      if (typeof result.data.trackingToken !== 'string') throw new Error('Token pelacakan tidak tersedia. Coba lagi.');
      sessionStorage.setItem(`jokihub-tracking:${normalizedOrder}`, result.data.trackingToken);
      const paymentRoute = `/order/${encodeURIComponent(normalizedOrder)}`;
      const resultRoute = `${paymentRoute}/result`;
      router.push(
        returnTo === paymentRoute || returnTo === resultRoute
          ? returnTo
          : `/cek-pesanan/${encodeURIComponent(normalizedOrder)}`
      );
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Pelacakan pesanan tidak tersedia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span>/</span>
          <b>Cek Pesanan</b>
        </nav>
        <section className={styles.hero}>
          <span className={styles.heroIcon}>
            <IconClipboardCheck />
          </span>
          <h1>Cek Pesanan</h1>
          <p>Pantau status pesanan layanan game kamu dengan mudah.</p>
        </section>
        <section className={styles.lookupLayout}>
          <Box className={styles.lookupCard} bordered rounded>
            <div className={styles.cardHeading}>
              <span>
                <IconSearch />
              </span>
              <div>
                <h2>Lacak pesanan kamu</h2>
                <p>Masukkan nomor pesanan dan WhatsApp yang digunakan saat pemesanan.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              {apiError && <p role="alert">{apiError}</p>}
              <label className={errors.includes('orderId') ? styles.invalid : ''}>
                Nomor Pesanan
                <input
                  value={orderId}
                  onChange={(event) => {
                    setOrderId(event.target.value);
                    setErrors((current) => current.filter((error) => error !== 'orderId'));
                  }}
                  placeholder="Contoh: JH-20261013-ABC123"
                  aria-invalid={errors.includes('orderId')}
                />
                {errors.includes('orderId') && <small>Nomor pesanan wajib diisi.</small>}
              </label>
              <label className={errors.includes('phone') ? styles.invalid : ''}>
                Nomor WhatsApp
                <input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setErrors((current) => current.filter((error) => error !== 'phone'));
                  }}
                  placeholder="Nomor WhatsApp saat memesan"
                  inputMode="tel"
                  aria-invalid={errors.includes('phone')}
                />
                {errors.includes('phone') && <small>Nomor WhatsApp wajib diisi.</small>}
              </label>
              <Button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? 'Memeriksa…' : 'Cek Status Pesanan'} <IconArrowRight />
              </Button>
            </form>
            <p className={styles.privacy}>
              <IconShieldCheck /> Data pesanan kamu hanya digunakan untuk verifikasi.
            </p>
          </Box>
          <aside className={styles.helpCard}>
            <h2>Butuh bantuan?</h2>
            <p>Pastikan nomor pesanan dan nomor WhatsApp sesuai dengan detail pesanan kamu.</p>
            <Link href="/bantuan">
              <IconHeadset /> Hubungi Bantuan <IconArrowRight />
            </Link>
          </aside>
        </section>
        <section className={styles.steps}>
          <h2>Bagaimana cara cek pesanan?</h2>
          <div className={styles.stepGrid}>
            <article>
              <span>
                <IconClipboardCheck />
              </span>
              <div>
                <b>1. Siapkan nomor pesanan</b>
                <p>Nomor pesanan tersedia setelah pesanan berhasil dibuat.</p>
              </div>
            </article>
            <article>
              <span>
                <IconShieldCheck />
              </span>
              <div>
                <b>2. Verifikasi nomor WhatsApp</b>
                <p>Gunakan nomor yang kamu masukkan saat memesan.</p>
              </div>
            </article>
            <article>
              <span>
                <IconTruckDelivery />
              </span>
              <div>
                <b>3. Pantau status layanan</b>
                <p>Status pesanan akan muncul setelah sistem pelacakan tersedia.</p>
              </div>
            </article>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};
