import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import styles from './Pagination.module.css';
type Props = { page: number; pageCount: number; onChange: (page: number) => void };
export const Pagination = ({ page, pageCount, onChange }: Props) => (
  <nav className={styles.pagination} aria-label="Halaman game">
    <button aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>
      <IconArrowLeft />
    </button>
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
      <button key={number} className={page === number ? styles.active : ''} onClick={() => onChange(number)}>
        {number}
      </button>
    ))}
    <button
      aria-label="Halaman berikutnya"
      disabled={page >= pageCount}
      onClick={() => onChange(Math.min(pageCount, page + 1))}
    >
      <IconArrowRight />
    </button>
  </nav>
);
