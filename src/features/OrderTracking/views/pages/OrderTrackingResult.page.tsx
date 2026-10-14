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
type TrackingData = {
  order: {
    orderNumber: string;
    status: string;
    statusLabel: string;
    gameName: string;
    serviceName: string;
    customerWhatsappMasked: string;
    paymentStatusLabel: string;
  };
  timeline: Array<{ status: string; label: string; description: string | null; occurredAt: string }>;
};

export const OrderTrackingResultPage = ({ orderId }: Props) => {
  const normalizedOrder = orderId.toUpperCase();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    let polling = true;
    const fetchStatus = async () => {
      if (!polling) return;
      try {
        const token = sessionStorage.getItem(`jokihub-tracking:${normalizedOrder}`);
        if (!token) {
          polling = false;
          if (alive) {
            setError('Sesi pelacakan berakhir. Verifikasi pesanan untuk melihat status terbaru.');
            setLoading(false);
          }
          return;
        }
        const response = await fetch(`/api/orders/v1/tracking/${encodeURIComponent(normalizedOrder)}/status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok || !result.data) {
          if ([400, 401, 404].includes(response.status)) {
            sessionStorage.removeItem(`jokihub-tracking:${normalizedOrder}`);
            polling = false;
            if (alive) setTracking(null);
          }
          throw new Error(result.status?.message ?? 'Pelacakan pesanan tidak tersedia.');
        }
        if (alive) {
          setTracking(result.data as TrackingData);
          setError('');
        }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : 'Pelacakan pesanan tidak tersedia.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    void fetchStatus();
    const timer = window.setInterval(() => void fetchStatus(), 30000);
    return () => {
      alive = false;
      polling = false;
      window.clearInterval(timer);
    };
  }, [normalizedOrder]);

  if (!tracking)
    return (
      <main className={styles.page}>
        <Header />
        <div className={styles.content}>
          <section className={styles.heading}>
            <h1>{loading ? 'Memuat status pesanan' : 'Verifikasi diperlukan'}</h1>
            <p role={error ? 'alert' : 'status'}>{error || 'Mengambil status pesanan…'}</p>
            <Link href="/cek-pesanan">Kembali ke cek pesanan</Link>
          </section>
        </div>
        <Footer />
      </main>
    );
  const order = tracking.order;

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
          <p>STATUS PESANAN</p>
          <h1>Status Pesanan</h1>
          <span className={styles.demoNote}>{order.paymentStatusLabel}</span>
          {error && <p role="status">Status terakhir ditampilkan. Pembaruan gagal dimuat.</p>}
        </section>

        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            <Box className={styles.card} bordered rounded>
              <div className={styles.orderTop}>
                <div>
                  <small>Nomor Pesanan</small>
                  <h2>{normalizedOrder}</h2>
                </div>
                <span className={styles.status}>
                  <IconClock aria-hidden="true" /> {order.statusLabel}
                </span>
              </div>
              <div className={styles.serviceRow}>
                <span className={styles.gameIcon}>
                  <IconPackage aria-hidden="true" />
                </span>
                <span>
                  <small>Layanan</small>
                  <b>
                    {order.gameName} · {order.serviceName}
                  </b>
                </span>
              </div>
              <div className={styles.timeline} aria-label="Tahapan pesanan">
                {tracking.timeline.map((item, index) => (
                  <div
                    className={`${styles.timelineItem} ${index < tracking.timeline.length - 1 ? styles.done : styles.active}`}
                    key={`${item.status}-${item.occurredAt}`}
                  >
                    <span className={styles.marker}>
                      <IconCheck aria-hidden="true" />
                    </span>
                    <div>
                      <b>{item.label}</b>
                      <p>{item.description ?? new Date(item.occurredAt).toLocaleString('id-ID')}</p>
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
                  <dd>{normalizedOrder}</dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>{order.customerWhatsappMasked}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className={styles.detailStatus}>{order.statusLabel}</dd>
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
