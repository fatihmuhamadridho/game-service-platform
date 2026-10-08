import { Button } from 'rangkaui';
import { IconArrowRight } from '@tabler/icons-react';
import styles from './StickyCheckout.module.css';
type Props = { totalLabel: string; onContinue: () => void };
export const StickyCheckout = ({ totalLabel, onContinue }: Props) => (
  <div className={styles.sticky}>
    <div>
      <small>Total</small>
      <b>{totalLabel}</b>
    </div>
    <Button className={styles.button} onClick={onContinue}>
      Lanjut Pembayaran <IconArrowRight />
    </Button>
  </div>
);
