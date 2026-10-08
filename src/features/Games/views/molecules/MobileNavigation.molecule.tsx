import { IconDeviceGamepad2, IconSearch, IconShoppingCart, IconUser } from '@tabler/icons-react';
import styles from './MobileNavigation.module.css';
export const MobileNavigation = () => (
  <nav className={styles.nav} aria-label="Navigasi bawah">
    <a href="/homepagev2">
      <IconDeviceGamepad2 />
      <small>Beranda</small>
    </a>
    <a href="/homepagev2#kategori">
      <IconSearch />
      <small>Layanan</small>
    </a>
    <a className={styles.current} href="/games">
      <IconDeviceGamepad2 />
      <small>Game</small>
    </a>
    <a href="#pesanan">
      <IconShoppingCart />
      <small>Pesanan</small>
    </a>
    <a href="#akun">
      <IconUser />
      <small>Akun</small>
    </a>
  </nav>
);
