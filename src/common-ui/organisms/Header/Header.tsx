'use client';

import { useState } from 'react';
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconDeviceGamepad2,
  IconMenu2,
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import styles from './Header.module.css';

type Props = {
  variant?: 'storefront' | 'checkout';
  activePage?: 'home' | 'games';
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showMobileSearch?: boolean;
  mobileSearchRow?: boolean;
  onMobileFilterToggle?: () => void;
};
const Logo = () => (
  <a className={styles.logo} href="/homepagev2">
    <span className={styles.logoIcon}>
      <IconDeviceGamepad2 />
    </span>
    <span>
      Joki<span>Hub</span>
    </span>
  </a>
);

export const Header = ({
  variant = 'storefront',
  activePage,
  searchValue,
  onSearchChange,
  showMobileSearch = true,
  mobileSearchRow = false,
  onMobileFilterToggle,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const search = searchValue ?? localSearch;
  const updateSearch = onSearchChange ?? setLocalSearch;
  return (
    <header className={`${styles.header} ${variant === 'checkout' ? styles.checkout : ''}`}>
      <div className={styles.navWrap}>
        <button className={styles.menuButton} aria-label="Buka menu" onClick={() => setMenuOpen(true)}>
          <IconMenu2 />
        </button>
        <Logo />
        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          <a className={activePage === 'home' ? styles.active : ''} href="/homepagev2">
            Beranda
          </a>
          <a href="/games">Games</a>
          <a href="/cek-pesanan">Cek Pesanan</a>
          <a href="/bantuan">Bantuan</a>
        </nav>
        {variant === 'storefront' && (
          <form
            className={`${styles.search} ${searchOpen ? styles.searchExpanded : ''}`}
            onSubmit={(event) => event.preventDefault()}
          >
            <IconSearch />
            <input
              aria-label="Cari game atau layanan"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Cari game atau layanan..."
            />
            <kbd>Ctrl K</kbd>
          </form>
        )}
        <div className={styles.actions}>
          {variant === 'storefront' ? (
            <>
              <button className={styles.cart} aria-label="Keranjang">
                <IconShoppingCart />
                <i>2</i>
              </button>
              <a className={styles.login} href="/login">
                Masuk
              </a>
              <a className={styles.register} href="/register">
                Daftar
              </a>
              {showMobileSearch && (
                <button className={styles.searchToggle} aria-label="Cari" onClick={() => setSearchOpen(!searchOpen)}>
                  <IconSearch />
                </button>
              )}
            </>
          ) : (
            <button className={styles.avatar} aria-label="Akun">
              <IconUser />
            </button>
          )}
        </div>
      </div>
      {variant === 'storefront' && mobileSearchRow && (
        <div className={styles.mobileSearchRow}>
          <IconSearch />
          <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Cari game..." />
          <button aria-label="Filter game" onClick={onMobileFilterToggle}>
            <IconAdjustmentsHorizontal />
          </button>
        </div>
      )}
      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)}>
          <nav className={styles.drawer} aria-label="Menu mobile" onClick={(event) => event.stopPropagation()}>
            <div>
              <Logo />
              <button aria-label="Tutup menu" onClick={() => setMenuOpen(false)}>
                <IconX />
              </button>
            </div>
            <a href="/homepagev2" onClick={() => setMenuOpen(false)}>
              Beranda
            </a>
            <a href="/games" onClick={() => setMenuOpen(false)}>
              Games
            </a>
            <a href="/cek-pesanan" onClick={() => setMenuOpen(false)}>
              Cek Pesanan
            </a>
            <a href="/bantuan" onClick={() => setMenuOpen(false)}>
              Bantuan
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
