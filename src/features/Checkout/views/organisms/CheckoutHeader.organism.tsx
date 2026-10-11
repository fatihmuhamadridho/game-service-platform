import { IconChevronRight } from '@tabler/icons-react';
import { Breadcrumb } from '../atoms/Breadcrumb.atom';
import { StepIndicator } from '../atoms/StepIndicator.atom';
import { Header } from '@common-ui/organisms/Header/Header';
import styles from './CheckoutHeader.module.css';
type Props = { game: string; step: number };
export const CheckoutHeader = ({ game, step }: Props) => (
  <>
    <Header />
    <div className={styles.content}>
      <Breadcrumb game={game} step={step} />
      <section className={styles.title}>
        <h1>{step === 3 ? 'Pembayaran' : 'Pesan Layanan'}</h1>
        <p>
          {step === 3
            ? 'Selesaikan pembayaran untuk memproses pesanan kamu dengan aman dan cepat.'
            : 'Ikuti langkah di bawah untuk memesan layanan joki dengan mudah dan cepat.'}
        </p>
      </section>
      <StepIndicator labels={['Pilih Game', 'Pilih Layanan', 'Detail Order', 'Bayar']} current={step} />
    </div>
  </>
);
