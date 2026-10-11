import Link from 'next/link';
import { IconCircleCheck, IconClock, IconHome } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import styles from './PaymentSuccess.module.css';

type Props = {
  game: string;
  service: CheckoutService;
  total: number;
  formatPrice: (value: number) => string;
};

export const PaymentSuccess = ({ game, service, total, formatPrice }: Props) => (
  <section className={styles.container} aria-labelledby="payment-success-title">
    <div className={styles.card}>
      <span className={styles.icon}>
        <IconCircleCheck aria-hidden="true" />
      </span>
      <p className={styles.eyebrow}>Simulasi pembayaran</p>
      <h1 id="payment-success-title">Pembayaran Berhasil</h1>
      <p className={styles.description}>
        Alur pembayaran berhasil dilewati. Status ini masih simulasi dan belum diverifikasi admin.
      </p>
      <div className={styles.status}>
        <IconClock aria-hidden="true" />
        <span>Menunggu validasi manual admin</span>
      </div>
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
