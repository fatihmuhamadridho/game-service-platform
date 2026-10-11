'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box } from 'rangkaui';
import {
  IconArrowLeft,
  IconCheck,
  IconClipboardCheck,
  IconClock,
  IconHeadset,
  IconPackage,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Header } from '@common-ui/organisms/Header/Header';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import styles from './OrderTrackingResult.module.css';

type Props = { orderId: string };

const progress = [
  { title: 'Pesanan dibuat', description: 'Detail pesanan berhasil diterima.', done: true },
  { title: 'Menunggu verifikasi pembayaran', description: 'Admin akan memeriksa pembayaran kamu.', done: true },
  {
    title: 'Pesanan diproses',
    description: 'Proses layanan akan dimulai setelah pembayaran tervalidasi.',
    active: true,
  },
  { title: 'Pesanan selesai', description: 'Pesanan selesai dan siap kamu nikmati.', done: false },
];

const maskPhone = (phone: string) =>
  phone.length > 5 ? `${phone.slice(0, 3)}••••${phone.slice(-3)}` : 'Tersimpan di perangkat ini';

export const OrderTrackingResultPage = ({ orderId }: Props) => {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setPhone(window.sessionStorage.getItem('jokihub-tracking-phone') ?? '');
  }, []);

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/homepagev2">Beranda</Link>
          <span>/</span>
          <Link href="/cek-pesanan">Cek Pesanan</Link>
          <span>/</span>
          <b>Detail Pesanan</b>
        </nav>
        <section className={styles.heading}>
          <span className={styles.headingIcon}>
            <IconClipboardCheck aria-hidden="true" />
          </span>
          <p>PRATINJAU TRACKING</p>
          <h1>Status Pesanan</h1>
          <span className={styles.demoNote}>Status pesanan di layar ini masih simulasi.</span>
        </section>

        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            <Box className={styles.card} bordered rounded>
              <div className={styles.orderTop}>
                <div>
                  <small>Nomor Pesanan</small>
                  <h2>{orderId}</h2>
                </div>
                <span className={styles.status}>
                  <IconClock aria-hidden="true" /> Sedang diproses
                </span>
              </div>
              <div className={styles.serviceRow}>
                <span className={styles.gameIcon}>
                  <IconPackage aria-hidden="true" />
                </span>
                <span>
                  <small>Layanan</small>
                  <b>Pesanan layanan game</b>
                </span>
              </div>
              <div className={styles.timeline} aria-label="Tahapan pesanan">
                {progress.map((item, index) => (
                  <div
                    className={`${styles.timelineItem} ${item.done ? styles.done : ''} ${item.active ? styles.active : ''}`}
                    key={item.title}
                  >
                    <span className={styles.marker}>{item.done ? <IconCheck aria-hidden="true" /> : index + 1}</span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Box>
            <div className={styles.actions}>
              <Link className={styles.secondaryButton} href="/cek-pesanan">
                <IconArrowLeft aria-hidden="true" /> Cek pesanan lain
              </Link>
              <Link className={styles.primaryButton} href="/bantuan">
                <IconHeadset aria-hidden="true" /> Hubungi Bantuan
              </Link>
            </div>
          </div>

          <aside>
            <Box className={styles.card} bordered rounded>
              <h2 className={styles.detailTitle}>Informasi Pelacakan</h2>
              <dl className={styles.details}>
                <div>
                  <dt>Nomor Pesanan</dt>
                  <dd>{orderId}</dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>{phone ? maskPhone(phone) : 'Tidak tersedia'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className={styles.detailStatus}>Sedang diproses</dd>
                </div>
              </dl>
              <p className={styles.privacy}>
                <IconShieldCheck aria-hidden="true" /> Nomor WhatsApp disamarkan untuk menjaga privasi.
              </p>
            </Box>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
};
