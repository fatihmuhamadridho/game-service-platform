import { IconArrowRight, IconDiamond } from '@tabler/icons-react';
import { Box, Button } from 'rangkaui';
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
    <Button
      className={styles.button}
      onClick={() => document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' })}
    >
      Top Up Sekarang <IconArrowRight />
    </Button>
    <span className={styles.spark}>✦</span>
  </Box>
);
