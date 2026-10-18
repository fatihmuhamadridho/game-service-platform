import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import styles from './Breadcrumb.module.css';
type Stage = 'selection' | 'payment' | 'result';
type Props = { game: string; stage?: Stage };
export const Breadcrumb = ({ game, stage = 'selection' }: Props) => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link href="/">Beranda</Link>
    <IconChevronRight />
    <Link href="/games">Shop</Link>
    <IconChevronRight />
    <span>{game}</span>
    <IconChevronRight />
    {stage !== 'selection' ? (
      <>
        <span>Pesan</span>
        <IconChevronRight />
        <b>{stage === 'result' ? 'Hasil Pembayaran' : 'Pembayaran'}</b>
      </>
    ) : (
      <b>Pesan</b>
    )}
  </nav>
);
