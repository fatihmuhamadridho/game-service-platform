import { Breadcrumb } from '../atoms/Breadcrumb.atom';
import { StepIndicator } from '../atoms/StepIndicator.atom';
import { Header } from '@common-ui/organisms/Header/Header';
import styles from './CheckoutHeader.module.css';
type Stage = 'selection' | 'payment' | 'result';
type Props = { game: string; stage: Stage };
export const CheckoutHeader = ({ game, stage }: Props) => (
  <>
    <Header />
    <div className={styles.content}>
      <Breadcrumb game={game} stage={stage} />
      <section className={styles.title}>
        <h1>{stage === 'selection' ? 'Pesan Layanan' : stage === 'payment' ? 'Pembayaran' : 'Hasil Pembayaran'}</h1>
        <p>
          {stage === 'selection'
            ? 'Ikuti langkah di bawah untuk memesan layanan joki dengan mudah dan cepat.'
            : stage === 'payment'
              ? 'Selesaikan pembayaran untuk memproses pesanan kamu dengan aman dan cepat.'
              : 'Pantau status pembayaran dan pesanan kamu.'}
        </p>
      </section>
      <StepIndicator
        labels={['Pilih Game & Layanan', 'Pembayaran', 'Hasil Pembayaran']}
        current={stage === 'selection' ? 0 : stage === 'payment' ? 1 : 2}
      />
    </div>
  </>
);
