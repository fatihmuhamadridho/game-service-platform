import { IconCheck } from '@tabler/icons-react';
import styles from './StepIndicator.module.css';
type Props = { labels: string[]; current: number };
export const StepIndicator = ({ labels, current }: Props) => (
  <ol
    className={styles.stepper}
    aria-label="Tahapan pemesanan"
    style={{ '--step-progress': `${(current / Math.max(labels.length - 1, 1)) * 66.6667}%` } as React.CSSProperties}
  >
    {labels.map((label, index) => (
      <li
        key={label}
        className={index <= current ? styles.current : ''}
        aria-current={index === current ? 'step' : undefined}
      >
        <span>{index < current ? <IconCheck /> : index + 1}</span>
        <b>{label}</b>
        <small>{label === 'Pilih Game & Layanan' ? 'Pilih game dan jenis layanan' : label === 'Pembayaran' ? 'Selesaikan pembayaran' : 'Status pembayaran kamu'}</small>
      </li>
    ))}
  </ol>
);
