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

type Props = { open: boolean; onClose: () => void };
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
export const AdminSidebar = ({ open, onClose }: Props) => (
  <>
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.mobileTop}>
        <b>Menu Admin</b>
        <button onClick={onClose} aria-label="Tutup menu">
          <IconX />
        </button>
      </div>
      <nav aria-label="Navigasi admin">
        {groups.map((group, index) => (
          <section key={group.label || 'dashboard'}>
            {group.label && <h2>{group.label}</h2>}
            {group.items.map(([label, Icon]) => (
              <a
                key={label}
                href={label === 'Dashboard' ? '/admin' : `/admin#${label.toLowerCase().replaceAll(' ', '-')}`}
                className={index === 0 ? styles.active : ''}
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
