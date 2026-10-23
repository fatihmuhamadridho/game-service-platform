'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useEffect, useRef, useState } from 'react';
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconDeviceGamepad2,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import styles from './Header.module.css';
import { FEATURE_REGISTER, FEATURE_SPRINT_2 } from '@configs/base.config';

type AccountType = 'ADMIN' | 'CUSTOMER';
type HeaderAccount = {
  accountType: AccountType;
  name: string;
  username: string;
  role: string;
  roleLabel: string;
  canAccessDashboard: boolean;
};

const hasRefreshCookieHint = (type: AccountType) =>
  document.cookie.split(';').some((cookie) => cookie.trim() === `jokihub-${type.toLowerCase()}-refresh-present=1`);

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
  <a className={styles.logo} href="/">
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
  const [account, setAccount] = useState<HeaderAccount | null>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const search = searchValue ?? localSearch;
  const updateSearch = onSearchChange ?? setLocalSearch;

  useEffect(() => {
    let active = true;
    const loadAccount = async (requestedType?: string | null) => {
      const savedType =
        requestedType ??
        window.sessionStorage.getItem('jokihub-session-type') ??
        window.localStorage.getItem('jokihub-session-type');
      const savedAccountType = savedType === 'ADMIN' || savedType === 'CUSTOMER' ? savedType : null;
      const accountType =
        savedAccountType ??
        (hasRefreshCookieHint('ADMIN') ? 'ADMIN' : hasRefreshCookieHint('CUSTOMER') ? 'CUSTOMER' : null);
      if (!accountType || !hasRefreshCookieHint(accountType)) {
        window.sessionStorage.removeItem('jokihub-session-type');
        window.localStorage.removeItem('jokihub-session-type');
        setAccount(null);
        return;
      }
      const sessionUrl = () =>
        `/api/auth/v1/session?accountType=${accountType}`;
      try {
        let response = await apiFetch(sessionUrl(), { cache: 'no-store' });
        if (!response.ok && response.status === 401) {
          const refreshType = accountType ?? response.headers.get('X-Account-Type');
          if (refreshType !== 'ADMIN' && refreshType !== 'CUSTOMER') {
            if (active) setAccount(null);
            return;
          }
          const refreshUrl =
            refreshType === 'ADMIN' ? '/api/admin/auth/v1/refresh-token' : '/api/auth/v1/refresh-token';
          const refreshed = await apiFetch(refreshUrl, { method: 'POST', cache: 'no-store' });
          if (refreshed.ok) response = await apiFetch(`/api/auth/v1/session?accountType=${refreshType}`, { cache: 'no-store' });
        }
        if (!active) return;
        if (!response.ok) {
          setAccount(null);
          if (response.status === 401) {
            window.sessionStorage.removeItem('jokihub-session-type');
            window.localStorage.removeItem('jokihub-session-type');
            window.dispatchEvent(new Event('jokihub:session-ended'));
          }
          return;
        }
        const result = (await response.json()) as { data?: HeaderAccount | null };
        const nextAccount = result.data ?? null;
        setAccount(nextAccount);
        if (nextAccount?.accountType) {
          window.sessionStorage.setItem('jokihub-session-type', nextAccount.accountType);
          window.localStorage.setItem('jokihub-session-type', nextAccount.accountType);
        }
      } catch {
        if (active) setAccount(null);
      }
    };

    const onSessionEstablished = (event: Event) => {
      void loadAccount((event as CustomEvent<AccountType>).detail);
    };

    const onSessionEnded = () => {
      setAccount(null);
      setProfileOpen(false);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'jokihub-session-type') return;
      if (event.newValue === 'ADMIN' || event.newValue === 'CUSTOMER') {
        window.sessionStorage.setItem('jokihub-session-type', event.newValue);
        void loadAccount(event.newValue);
      } else {
        setAccount(null);
        setProfileOpen(false);
        window.sessionStorage.removeItem('jokihub-session-type');
      }
    };
    void loadAccount();
    window.addEventListener('jokihub:session-established', onSessionEstablished);
    window.addEventListener('jokihub:session-ended', onSessionEnded);
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener('jokihub:session-established', onSessionEstablished);
      window.removeEventListener('jokihub:session-ended', onSessionEnded);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
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

  const logout = async () => {
    if (!account || loggingOut) return;
    setLoggingOut(true);
    setLogoutError('');
    try {
      const endpoint = account.accountType === 'ADMIN' ? '/api/admin/auth/v1/logout' : '/api/auth/v1/logout';
      const response = await apiFetch(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error('Logout gagal. Coba lagi.');
      window.sessionStorage.removeItem('jokihub-session-type');
      window.localStorage.removeItem('jokihub-session-type');
      window.dispatchEvent(new Event('jokihub:session-ended'));
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Logout gagal. Coba lagi.');
    } finally {
      setLoggingOut(false);
    }
  };

  const profileAction = account ? (
    <div className={styles.profileMenu} ref={profileRef}>
      <button
        className={styles.profileToggle}
        aria-label={`Menu akun ${account.name}`}
        aria-haspopup="menu"
        aria-expanded={profileOpen}
        aria-controls="public-profile-menu"
        onClick={() => setProfileOpen((open) => !open)}
      >
        <span className={styles.profileAvatar}>{account.name.trim().charAt(0).toUpperCase() || 'A'}</span>
        <span className={styles.profileText}>
          <b>{account.name}</b>
          <small>{account.roleLabel}</small>
        </span>
        <IconChevronDown aria-hidden="true" />
      </button>
      {profileOpen && (
        <div className={styles.profileDropdown} id="public-profile-menu" role="menu" aria-label="Menu akun">
          <div className={styles.dropdownIdentity}>
            <b>{account.name}</b>
            <small>{account.roleLabel}</small>
          </div>
          {account.canAccessDashboard && (
            <a href="/admin" role="menuitem" onClick={() => setProfileOpen(false)}>
              <IconLayoutDashboard aria-hidden="true" /> Dashboard Admin
            </a>
          )}
          <button role="menuitem" disabled={loggingOut} onClick={() => void logout()}>
            <IconLogout aria-hidden="true" /> {loggingOut ? 'Keluar…' : 'Keluar'}
          </button>
          {logoutError && (
            <p className={styles.logoutError} role="alert">
              {logoutError}
            </p>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <header className={`${styles.header} ${variant === 'checkout' ? styles.checkout : ''}`}>
      <div className={styles.navWrap}>
        <button className={styles.menuButton} aria-label="Buka menu" onClick={() => setMenuOpen(true)}>
          <IconMenu2 />
        </button>
        <Logo />
        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          <a className={activePage === 'home' ? styles.active : ''} href="/">
            Beranda
          </a>
          <a href="/games">Games</a>
          <a href="/cek-pesanan">Cek Pesanan</a>
          {FEATURE_SPRINT_2 && <a href="/bantuan">Bantuan</a>}
        </nav>
        {FEATURE_SPRINT_2 ? (
          variant === 'storefront' && (
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
          )
        ) : (
          <form className="w-full"></form>
        )}
        <div className={styles.actions}>
          {variant === 'storefront' ? (
            <>
              {account ? (
                profileAction
              ) : account === null ? (
                <>
                  {FEATURE_SPRINT_2 && (
                    <button className={styles.cart} aria-label="Keranjang">
                      <IconShoppingCart />
                      <i>2</i>
                    </button>
                  )}
                  <a className={styles.login} href="/login">
                    Masuk
                  </a>
                  {FEATURE_REGISTER && (
                    <a className={styles.register} href="/register">
                      Daftar
                    </a>
                  )}
                </>
              ) : null}
              {FEATURE_SPRINT_2 && showMobileSearch && (
                <button className={styles.searchToggle} aria-label="Cari" onClick={() => setSearchOpen(!searchOpen)}>
                  <IconSearch />
                </button>
              )}
            </>
          ) : (
            (profileAction ?? (
              <a className={styles.avatar} aria-label="Masuk" href="/login">
                <IconUser />
              </a>
            ))
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
            <a href="/" onClick={() => setMenuOpen(false)}>
              Beranda
            </a>
            <a href="/games" onClick={() => setMenuOpen(false)}>
              Games
            </a>
            <a href="/cek-pesanan" onClick={() => setMenuOpen(false)}>
              Cek Pesanan
            </a>
            {FEATURE_SPRINT_2 && (
              <a href="/bantuan" onClick={() => setMenuOpen(false)}>
                Bantuan
              </a>
            )}
            {account === null && (
              <div className={styles.drawerAuthActions}>
                <a className={styles.drawerLogin} href="/login" onClick={() => setMenuOpen(false)}>
                  Masuk
                </a>
                {FEATURE_REGISTER && (
                  <a className={styles.drawerRegister} href="/register" onClick={() => setMenuOpen(false)}>
                    Daftar
                  </a>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
