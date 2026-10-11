'use client';

import {
  IconAdjustments,
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
  IconBell,
} from '@tabler/icons-react';
import styles from './AdminSidebar.module.css';

type Props = { open: boolean; onClose: () => void; activeItem?: string };
const groups = [
  { label: '', items: [['Dashboard', IconHomeFilled]] },
  {
    label: 'Order',
    items: [
      ['Pesanan', IconFileText],
      ['Top Up Manual', IconWallet],
      ['Refund', IconHistory],
      ['Komplain', IconHelpCircle],
    ],
  },
  {
    label: 'Produk & Layanan',
    items: [
      ['Game', IconDeviceGamepad2],
      ['Kategori Layanan', IconListDetails],
      ['Layanan', IconReceipt],
      ['Voucher', IconTag],
    ],
  },
  {
    label: 'Keuangan',
    items: [
      ['Transaksi', IconCreditCard],
      ['Payout', IconWallet],
      ['Rekening', IconCreditCard],
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
  {
    label: 'Konten',
    items: [
      ['Banner', IconFileText],
      ['Pengumuman', IconBell],
      ['Halaman', IconFileText],
      ['FAQ', IconHelpCircle],
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      ['Pengaturan Umum', IconAdjustments],
      ['Akun & Role', IconUsers],
      ['Log Aktivitas', IconHistory],
    ],
  },
] as const;
export const AdminSidebar = ({ open, onClose, activeItem = 'Dashboard' }: Props) => (
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
                href={
                  label === 'Dashboard'
                    ? '/admin'
                    : label === 'Pesanan'
                      ? '/admin/orders'
                      : label === 'Top Up Manual'
                        ? '/admin/manual-top-ups'
                        : label === 'Refund'
                          ? '/admin/refunds'
                          : label === 'Komplain'
                            ? '/admin/complaints'
                            : label === 'Transaksi'
                              ? '/admin/transactions'
                              : label === 'Payout'
                                ? '/admin/payouts'
                                : label === 'Rekening'
                                  ? '/admin/bank-accounts'
                                  : label === 'Game'
                                    ? '/admin/games'
                                    : label === 'Kategori Layanan'
                                      ? '/admin/service-categories'
                                      : label === 'Layanan'
                                        ? '/admin/services'
                                        : label === 'User'
                                          ? '/admin/users'
                                          : label === 'Member'
                                            ? '/admin/members'
                                            : label === 'Admin'
                                              ? '/admin/admins'
                                              : label === 'Banner'
                                                ? '/admin/banners'
                                                : label === 'Pengumuman'
                                                  ? '/admin/announcements'
                                                  : label === 'Halaman'
                                                    ? '/admin/pages'
                                                    : label === 'FAQ'
                                                      ? '/admin/faqs'
                                                      : label === 'Pengaturan Umum'
                                                        ? '/admin/settings'
                                                        : label === 'Akun & Role'
                                                          ? '/admin/settings/accounts-roles'
                                                          : label === 'Log Aktivitas'
                                                            ? '/admin/activity-logs'
                                                            : `/admin#${label.toLowerCase().replaceAll(' ', '-')}`
                }
                className={label === activeItem ? styles.active : ''}
                onClick={onClose}
              >
                <Icon />
                <span>{label}</span>
                {label === 'Pesanan' && <i>24</i>}
              </a>
            ))}
          </section>
        ))}
      </nav>
      <div className={styles.sidebarBrand}>
        <IconDeviceGamepad2 />
        <span>
          <b>JokiHub</b>
          <small>v1.0.0</small>
        </span>
      </div>
    </aside>
    {open && <button className={styles.backdrop} onClick={onClose} aria-label="Tutup navigasi" />}
  </>
);
