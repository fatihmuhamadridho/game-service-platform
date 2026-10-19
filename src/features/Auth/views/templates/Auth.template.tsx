import Image from 'next/image';
import type { ReactNode } from 'react';
import { IconRosetteDiscountCheck, IconShieldCheck, IconSparkles, IconUser } from '@tabler/icons-react';
import { Header } from '@common-ui/organisms/Header/Header';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { AuthSocial } from '../molecules/AuthSocial.molecule';
import { FEATURE_GOOGLE_AUTH, FEATURE_REGISTER, FEATURE_SPRINT_2 } from '@configs/base.config';
import styles from './Auth.module.css';

type Props = { mode: 'login' | 'register' | 'recovery' | 'reset'; children: ReactNode };

export function AuthTemplate({ mode, children }: Props) {
  const isRegister = mode === 'register';
  const isRecovery = mode === 'recovery';
  const isReset = mode === 'reset';
  const isAccountAction = isRecovery || isReset;
  const title = isRegister
    ? 'Buat Akun Baru'
    : isRecovery
      ? 'Lupa Password?'
      : isReset
        ? 'Atur Password Baru'
        : 'Masuk ke Akun';
  const benefits = [
    {
      icon: IconUser,
      title: isRegister ? 'Daftar gratis' : 'Proses lebih cepat',
      description: isRegister ? 'Buat akun dalam hitungan detik' : 'Pesan layanan tanpa ribet',
    },
    { icon: IconShieldCheck, title: 'Riwayat pesanan lengkap', description: 'Pantau semua transaksi' },
    { icon: IconRosetteDiscountCheck, title: 'Akses semua fitur', description: 'Top up, joki, dan layanan lainnya' },
  ];
  return (
    <main className={styles.page}>
      <Header />
      <section
        className={styles.authLayout}
        aria-label={isRegister ? 'Buat akun JokiHub' : isAccountAction ? 'Pemulihan akun JokiHub' : 'Masuk ke JokiHub'}
      >
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            <IconSparkles aria-hidden="true" />
            {isRegister ? 'Bergabung Sekarang' : isAccountAction ? 'Pemulihan Akun' : 'Top Up & Joki Terpercaya'}
          </span>
          <h1>
            {isRegister ? (
              <>
                Buat Akun
                <br />
                Joki<span>Hub</span>
              </>
            ) : isAccountAction ? (
              <>
                {isRecovery ? 'Pulihkan' : 'Atur'}
                <br />
                Akun Joki<span>Hub</span>
              </>
            ) : (
              <>
                Masuk ke
                <br />
                Akun Joki<span>Hub</span>
              </>
            )}
          </h1>
          <p>
            {isRegister
              ? 'Daftar sekarang dan nikmati kemudahan top up, joki game, serta berbagai layanan gaming terpercaya.'
              : isAccountAction
                ? 'Ikuti langkah pemulihan untuk kembali mengakses akun JokiHub kamu.'
                : 'Lanjutkan perjalanan gaming kamu dengan akun JokiHub. Akses riwayat pesanan, kelola akun, dan nikmati layanan lebih cepat.'}
          </p>
          <ul className={styles.benefits}>
            {benefits.map(({ icon: BenefitIcon, title, description }) => (
              <li key={title}>
                <span className={styles.benefitIcon}>
                  <BenefitIcon aria-hidden="true" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          <Image
            src="/images/hero-login.png"
            alt=""
            fill
            sizes="(max-width: 720px) 180px, (max-width: 1050px) 280px, 440px"
            priority
            className={styles.heroImage}
          />
        </div>
        <section
          className={`${styles.card} ${isRegister ? styles.registerCard : ''}`}
          id="auth-form"
          aria-labelledby="form-title"
        >
          <div className={styles.cardHeading}>
            <h2 id="form-title">{title}</h2>
            <p>
              {isRegister
                ? 'Lengkapi data berikut untuk membuat akun JokiHub'
                : isRecovery
                  ? 'Masukkan email akun customer untuk menerima tautan pemulihan'
                  : isReset
                    ? 'Gunakan password baru untuk mengamankan akun'
                    : 'Masukkan informasi akun kamu untuk melanjutkan'}
            </p>
          </div>
          {children}
          {!isAccountAction && (FEATURE_GOOGLE_AUTH || FEATURE_SPRINT_2) && (
            <>
              <div className={styles.divider}>
                <span />
                atau {isRegister ? 'daftar' : 'masuk'} dengan
                <span />
              </div>
              <AuthSocial verb={isRegister ? 'Daftar' : 'Masuk'} />
            </>
          )}
          {(isRegister || isAccountAction || FEATURE_REGISTER) && (
            <p className={styles.switchMode}>
              {isRegister ? 'Sudah punya akun?' : isAccountAction ? 'Ingat password?' : 'Belum punya akun?'}{' '}
              <a href={isRegister || isAccountAction ? '/login' : '/register'}>
                {isRegister || isAccountAction ? 'Masuk sekarang' : 'Daftar sekarang'}
              </a>
            </p>
          )}
        </section>
      </section>
      <Footer />
    </main>
  );
}
