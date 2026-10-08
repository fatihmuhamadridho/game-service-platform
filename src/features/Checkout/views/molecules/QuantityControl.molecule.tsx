import { IconMinus, IconPlus } from '@tabler/icons-react';
import styles from './QuantityControl.module.css';
type Props = { value: number; onChange: (value: number) => void };
export const QuantityControl = ({ value, onChange }: Props) => (
  <div className={styles.control}>
    <button aria-label="Kurangi jumlah" onClick={() => onChange(Math.max(1, value - 1))}>
      <IconMinus />
    </button>
    <b>{value}</b>
    <button aria-label="Tambah jumlah" onClick={() => onChange(value + 1)}>
      <IconPlus />
    </button>
  </div>
);
