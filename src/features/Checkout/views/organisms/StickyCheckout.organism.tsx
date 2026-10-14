import { Button } from 'rangkaui';
import { IconArrowRight } from '@tabler/icons-react';
import styles from './StickyCheckout.module.css';
type Props = { totalLabel: string; onContinue: () => void; disabled?: boolean };
export const StickyCheckout = ({ totalLabel, onContinue, disabled = false }: Props) => (
  <div className={styles.sticky}>
    <div>
      <small>Total</small>
      <b>{totalLabel}</b>
    </div>
    <Button className={styles.button} onClick={onContinue} disabled={disabled}>
      Lanjut Pembayaran <IconArrowRight />
    </Button>
  </div>
);
