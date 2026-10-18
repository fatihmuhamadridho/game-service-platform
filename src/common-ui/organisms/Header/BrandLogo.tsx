import { IconDeviceGamepad2 } from '@tabler/icons-react';
import styles from './Header.module.css';
export const BrandLogo = () => (
  <a className={styles.logo} href="/">
    <span className={styles.logoIcon}>
      <IconDeviceGamepad2 />
    </span>
    <span>
      Joki<span>Hub</span>
    </span>
  </a>
);
