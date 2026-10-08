import { IconChevronRight } from '@tabler/icons-react';
import { Breadcrumb } from '../atoms/Breadcrumb.atom';
import { StepIndicator } from '../atoms/StepIndicator.atom';
import { Header } from '@common-ui/Header/Header';
import styles from './CheckoutHeader.module.css';
type Props = { game: string; step: number };
export const CheckoutHeader = ({ game, step }: Props) => (
  <>
    <Header />
    <div className={styles.content}>
      <Breadcrumb game={game} />
      <section className={styles.title}>
        <h1>Pesan Layanan</h1>
        <p>Ikuti langkah di bawah untuk memesan layanan joki dengan mudah dan cepat.</p>
      </section>
      <StepIndicator labels={['Pilih Game', 'Pilih Layanan', 'Detail Order', 'Bayar']} current={step} />
    </div>
  </>
);
