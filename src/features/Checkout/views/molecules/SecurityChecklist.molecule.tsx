import { Box } from 'rangkaui';
import { IconCheck, IconShieldCheck } from '@tabler/icons-react';
import styles from './SecurityChecklist.module.css';
export const SecurityChecklist = () => (
  <Box className={styles.panel} bordered rounded>
    <h3>
      <IconShieldCheck />
      Garansi &amp; Keamanan
    </h3>
    <ul>
      <li>
        <IconCheck />
        Data akun aman dan rahasia
      </li>
      <li>
        <IconCheck />
        Proses transaksi terenkripsi
      </li>
      <li>
        <IconCheck />
        Bisa konsultasi dengan admin
      </li>
      <li>
        <IconCheck />
        Garansi jika terjadi kendala
      </li>
    </ul>
    <small>Ketentuan garansi mengikuti kebijakan layanan.</small>
  </Box>
);
