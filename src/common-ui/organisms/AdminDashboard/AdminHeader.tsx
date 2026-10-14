'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconBell, IconChevronDown, IconDeviceGamepad2, IconLogout, IconMenu2, IconSearch } from '@tabler/icons-react';
import styles from './AdminHeader.module.css';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenuOpen: () => void;
};

export const AdminHeader = ({ query, onQueryChange, onMenuOpen }: Props) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileOpen]);

  return (
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
      {FEATURE_SPRINT_2 && (
        <label className={styles.search}>
          <IconSearch />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari pesanan, user, game, atau layanan..."
          />
          <kbd>Ctrl K</kbd>
        </label>
      )}
      <div className={styles.actions} ref={actionsRef}>
        {FEATURE_SPRINT_2 && (
          <button className={styles.bell} aria-label="Notifikasi">
            <IconBell />
            <i />
          </button>
        )}
        <button
          className={styles.profile}
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          aria-controls="admin-profile-menu"
          onClick={() => setProfileOpen((open) => !open)}
        >
          <span className={styles.avatar}>F</span>
          <span>
            <b>Fatih Muhamad Ridho</b>
            <small>Super Admin</small>
          </span>
          <IconChevronDown />
        </button>
        <button
          className={styles.mobileAvatar}
          aria-label="Profil"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          aria-controls="admin-profile-menu"
          onClick={() => setProfileOpen((open) => !open)}
        >
          A
        </button>
        {profileOpen && (
          <div className={styles.profileDropdown} id="admin-profile-menu" role="menu" aria-label="Menu profil">
            <div className={styles.dropdownIdentity}>
              <b>Fatih Muhamad Ridho</b>
              <small>Super Admin</small>
            </div>
            <Link href="/login" role="menuitem" onClick={() => setProfileOpen(false)}>
              <IconLogout aria-hidden="true" /> Keluar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
