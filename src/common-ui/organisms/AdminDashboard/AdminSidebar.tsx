'use client';

import { useRouter } from 'next/navigation';
import {
  IconAdjustments,
  IconBell,
  IconCreditCard,
  IconDeviceGamepad2,
  IconFileText,
  IconHeart,
  IconHelpCircle,
  IconHistory,
  IconHomeFilled,
  IconListDetails,
  IconReceipt,
  IconShieldCheck,
  IconTag,
  IconUsers,
  IconWallet,
  IconX,
  IconLogout,
} from '@tabler/icons-react';
import styles from './AdminSidebar.module.css';
import { APP_VERSION } from '@configs/base.config';

type Props = { open: boolean; onClose: () => void; activeItem?: string };
const groups = [
  { label: '', items: [['Dashboard', IconHomeFilled]] },
  {
    label: 'Order',
    items: [
      ['Pesanan', IconFileText],
      // ['Top Up Manual', IconWallet],
      // ['Refund', IconHistory],
      // ['Komplain', IconHelpCircle],
    ],
  },
  {
    label: 'Produk & Layanan',
    items: [
      ['Game', IconDeviceGamepad2],
      ['Kategori Layanan', IconListDetails],
      ['Layanan', IconReceipt],
      // ['Voucher', IconTag],
    ],
  },
  {
    label: 'Keuangan',
    items: [
      ['Transaksi', IconCreditCard],
      // ['Payout', IconWallet],
      // ['Rekening', IconCreditCard],
    ],
  },
  {
    label: 'Pengguna',
    items: [
      ['User', IconUsers],
      ['Member', IconHeart],
      ['Admin', IconShieldCheck],
    ],
  },
  // {
  //   label: 'Konten',
  //   items: [
  //     ['Banner', IconFileText],
  //     ['Pengumuman', IconBell],
  //     ['Halaman', IconFileText],
  //     ['FAQ', IconHelpCircle],
  //   ],
  // },
  {
    label: 'Pengaturan',
    items: [
      ['Pengaturan Umum', IconAdjustments],
      ['Akun & Role', IconUsers],
      ['Log Aktivitas', IconHistory],
    ],
  },
] as const;

const routeFor = (label: string) =>
  ({
    Dashboard: '/admin',
    Pesanan: '/admin/orders',
    'Top Up Manual': '/admin/manual-top-ups',
    Refund: '/admin/refunds',
    Komplain: '/admin/complaints',
    Transaksi: '/admin/transactions',
    Payout: '/admin/payouts',
    Rekening: '/admin/bank-accounts',
    Game: '/admin/games',
    'Kategori Layanan': '/admin/service-categories',
    Layanan: '/admin/services',
    User: '/admin/users',
    Member: '/admin/members',
    Admin: '/admin/admins',
    Banner: '/admin/banners',
    Pengumuman: '/admin/announcements',
    Halaman: '/admin/pages',
    FAQ: '/admin/faqs',
    'Pengaturan Umum': '/admin/settings',
    'Akun & Role': '/admin/settings/accounts-roles',
    'Log Aktivitas': '/admin/activity-logs',
  })[label] ?? `/admin#${label.toLowerCase().replaceAll(' ', '-')}`;

export const AdminSidebar = ({ open, onClose, activeItem = 'Dashboard' }: Props) => {
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch('/api/admin/auth/v1/logout', { method: 'POST' });
      if (response.ok) {
        window.sessionStorage.removeItem('jokihub-session-type');
        window.localStorage.removeItem('jokihub-session-type');
        window.dispatchEvent(new Event('jokihub:session-ended'));
        router.replace('/login');
        router.refresh();
      }
    } catch {
      /* Keep session UI available if logout request fails. */
    }
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.mobileTop}>
          <b>Menu Admin</b>
          <button onClick={onClose} aria-label="Tutup menu">
            <IconX />
          </button>
        </div>
        <nav aria-label="Navigasi admin">
          {groups.map((group) => (
            <section key={group.label || 'dashboard'}>
              {group.label && <h2>{group.label}</h2>}
              {group.items.map(([label, Icon]) => (
                <a
                  key={label}
                  href={routeFor(label)}
                  className={label === activeItem ? styles.active : ''}
                  onClick={onClose}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
            </section>
          ))}
        </nav>
        <div className={styles.sidebarBrand}>
          <IconDeviceGamepad2 />
          <span>
            <b>JokiHub</b>
            <small>v{APP_VERSION}</small>
          </span>
          <button
            className={styles.logout}
            type="button"
            onClick={() => void logout()}
            aria-label="Keluar dari dashboard admin"
            title="Keluar"
          >
            <IconLogout />
          </button>
        </div>
      </aside>
      {open && <button className={styles.backdrop} onClick={onClose} aria-label="Tutup navigasi" />}
    </>
  );
};
