import { IconArrowRight, IconDiamond } from '@tabler/icons-react';
import Link from 'next/link';
import { Box } from 'rangkaui';
import styles from './PromoBanner.module.css';

export const PromoBanner = () => (
  <Box className={styles.banner} bordered rounded>
    <div className={styles.diamond}>
      <IconDiamond />
    </div>
    <div className={styles.copy}>
      <h2>Butuh Top Up Cepat?</h2>
      <p>Proses otomatis, masuk dalam hitungan detik!</p>
    </div>
    <Link className={styles.button} href="/order">
      <span>Top Up Sekarang</span>
      <IconArrowRight aria-hidden="true" />
    </Link>
    <span className={styles.spark}>✦</span>
  </Box>
);
