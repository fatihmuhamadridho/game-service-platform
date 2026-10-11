'use client';

import { IconBell, IconChevronDown, IconDeviceGamepad2, IconMenu2, IconSearch } from '@tabler/icons-react';
import styles from './AdminHeader.module.css';

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenuOpen: () => void;
};

export const AdminHeader = ({ query, onQueryChange, onMenuOpen }: Props) => (
  <header className={styles.header}>
    <div className={styles.brand}>
      <button className={styles.menu} aria-label="Buka navigasi admin" onClick={onMenuOpen}>
        <IconMenu2 />
      </button>
      <a href="/admin">
        <IconDeviceGamepad2 />
        <b>
          Joki<span>Hub</span>
        </b>
      </a>
      <small>Admin</small>
    </div>
    <label className={styles.search}>
      <IconSearch />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Cari pesanan, user, game, atau layanan..."
      />
      <kbd>Ctrl K</kbd>
    </label>
    <div className={styles.actions}>
      <button className={styles.bell} aria-label="Notifikasi">
        <IconBell />
        <i />
      </button>
      <button className={styles.profile}>
        <span className={styles.avatar}>F</span>
        <span>
          <b>Fatih Muhamad Ridho</b>
          <small>Super Admin</small>
        </span>
        <IconChevronDown />
      </button>
      <button className={styles.mobileAvatar} aria-label="Profil">
        A
      </button>
    </div>
  </header>
);
