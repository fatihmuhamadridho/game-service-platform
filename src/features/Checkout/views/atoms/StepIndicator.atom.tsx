import { IconCheck } from '@tabler/icons-react';
import styles from './StepIndicator.module.css';
const descriptions = [
  'Pilih game yang ingin kamu pesan',
  'Pilih jenis layanan',
  'Lengkapi informasi akun',
  'Pilih metode pembayaran',
];
type Props = { labels: string[]; current: number };
export const StepIndicator = ({ labels, current }: Props) => (
  <ol
    className={styles.stepper}
    aria-label="Tahapan pemesanan"
    style={{ '--step-progress': `${current * 25}%` } as React.CSSProperties}
  >
    {labels.map((label, index) => (
      <li
        key={label}
        className={index <= current ? styles.current : ''}
        aria-current={index === current ? 'step' : undefined}
      >
        <span>{index < current ? <IconCheck /> : index + 1}</span>
        <b>{label}</b>
        <small>{descriptions[index]}</small>
      </li>
    ))}
  </ol>
);
