import { IconDeviceGamepad2 } from '@tabler/icons-react';
import Link from 'next/link';
import styles from './Header.module.css';
export const BrandLogo = ({ name = 'JokiHub' }: { name?: string }) => (
  <Link className={styles.logo} href="/">
    <span className={styles.logoIcon}>
      <IconDeviceGamepad2 />
    </span>
    <span>{name}</span>
  </Link>
);
