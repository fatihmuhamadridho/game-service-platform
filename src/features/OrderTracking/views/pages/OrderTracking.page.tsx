'use client';

import { useState, type FormEvent } from 'react';
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

export const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = [!orderId.trim() ? 'orderId' : '', !phone.trim() ? 'phone' : ''].filter(Boolean);
    setErrors(missing);
    setSubmitted(missing.length === 0);
  };

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/homepagev2">Beranda</a>
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
              <label className={errors.includes('orderId') ? styles.invalid : ''}>
                Nomor Pesanan
                <input
                  value={orderId}
                  onChange={(event) => {
                    setOrderId(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Contoh: JH-2026-000123"
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
                    setSubmitted(false);
                  }}
                  placeholder="Nomor WhatsApp saat memesan"
                  inputMode="tel"
                  aria-invalid={errors.includes('phone')}
                />
                {errors.includes('phone') && <small>Nomor WhatsApp wajib diisi.</small>}
              </label>
              <Button type="submit" className={styles.submit}>
                Cek Status Pesanan <IconArrowRight />
              </Button>
            </form>
            {submitted && (
              <div className={styles.notice} role="status">
                <IconShieldCheck />
                <span>
                  <b>Pengecekan belum tersedia</b>
                  <small>Data pesanan belum terhubung ke sistem. Coba lagi nanti atau hubungi tim bantuan.</small>
                </span>
              </div>
            )}
            <p className={styles.privacy}>
              <IconShieldCheck /> Data pesanan kamu hanya digunakan untuk verifikasi.
            </p>
          </Box>
          <aside className={styles.helpCard}>
            <h2>Butuh bantuan?</h2>
            <p>Pastikan nomor pesanan dan nomor WhatsApp sesuai dengan detail pesanan kamu.</p>
            <a href="#bantuan">
              <IconHeadset /> Hubungi Bantuan <IconArrowRight />
            </a>
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
