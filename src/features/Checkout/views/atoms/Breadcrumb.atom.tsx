import { IconChevronRight } from '@tabler/icons-react';
import styles from './Breadcrumb.module.css';
type Props = { game: string; step?: number };
export const Breadcrumb = ({ game, step = 0 }: Props) => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <a href="/homepagev2">Beranda</a>
    <IconChevronRight />
    <a href="/games">Shop</a>
    <IconChevronRight />
    <span>{game}</span>
    <IconChevronRight />
    {step === 3 ? (
      <>
        <span>Pesan</span>
        <IconChevronRight />
        <b>Pembayaran</b>
      </>
    ) : (
      <b>Pesan</b>
    )}
  </nav>
);
