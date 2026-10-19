import Link from 'next/link';
import { IconDeviceGamepad2, IconHome, IconLock, IconSearch } from '@tabler/icons-react';
import styles from './RouteErrorState.module.css';

type Props = { code: 403 | 404 };
type ErrorContent = {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof IconLock | typeof IconSearch;
  primaryLabel: string;
};

const content: Record<403 | 404, ErrorContent> = {
  403: {
    eyebrow: 'Akses dibatasi',
    title: 'Kamu belum bisa masuk ke sini.',
    description: 'Halaman ini hanya tersedia untuk akun dengan izin yang sesuai.',
    icon: IconLock,
    primaryLabel: 'Kembali ke beranda',
  },
  404: {
    eyebrow: 'Halaman tidak ditemukan',
    title: 'Waduh, halaman ini nggak ada.',
    description: 'Mungkin alamatnya salah atau halaman sudah dipindahkan. Coba lanjut dari beranda.',
    icon: IconSearch,
    primaryLabel: 'Kembali ke beranda',
  },
};

export function RouteErrorState({ code }: Props) {
  const page = content[code];
  const StatusIcon = page.icon;

  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="error-title">
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.orbit} />
          <span className={styles.gameIcon}>
            <IconDeviceGamepad2 />
          </span>
          <span className={styles.statusIcon}>
            <StatusIcon />
          </span>
          <strong>{code}</strong>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 id="error-title">{page.title}</h1>
          <p className={styles.description}>{page.description}</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/">
              <IconHome aria-hidden="true" /> {page.primaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
