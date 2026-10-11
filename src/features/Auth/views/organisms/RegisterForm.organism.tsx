'use client';

import { useState, type FormEvent } from 'react';
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const confirmation = form.elements.namedItem('password-confirmation') as HTMLInputElement;
    if (password.value !== confirmation.value) {
      confirmation.setCustomValidity('Konfirmasi password belum sama.');
      confirmation.reportValidity();
      return;
    }
    confirmation.setCustomValidity('');
    setNotice('Pendaftaran siap diproses setelah layanan akun JokiHub tersedia.');
  }
  return (
    <>
      <div className={styles.cardHeading}>
        <h2 id="form-title">Buat Akun Baru</h2>
        <p>Lengkapi data berikut untuk membuat akun JokiHub</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Nama Lengkap</span>
          <span className={styles.inputWrap}>
            <IconUser aria-hidden="true" />
            <input autoComplete="name" name="name" placeholder="Contoh: Budi Santoso" required />
          </span>
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <span className={styles.inputWrap}>
            <IconMail aria-hidden="true" />
            <input autoComplete="email" name="email" type="email" placeholder="contoh: kamu@email.com" required />
          </span>
        </label>
        <label className={styles.field}>
          <span>No. WhatsApp</span>
          <span className={`${styles.inputWrap} ${styles.phoneWrap}`}>
            <select aria-label="Kode negara" defaultValue="+62">
              <option value="+62">+62</option>
              <option value="+60">+60</option>
              <option value="+65">+65</option>
            </select>
            <input autoComplete="tel-national" name="phone" type="tel" placeholder="81234567890" required />
          </span>
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <span className={styles.inputWrap}>
            <IconLock aria-hidden="true" />
            <input
              autoComplete="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Buat password (minimal 6 karakter)"
              minLength={6}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </span>
        </label>
        <label className={styles.field}>
          <span>Konfirmasi Password</span>
          <span className={styles.inputWrap}>
            <IconLock aria-hidden="true" />
            <input
              autoComplete="new-password"
              name="password-confirmation"
              type={showConfirmation ? 'text' : 'password'}
              placeholder="Ulangi password"
              minLength={6}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              aria-label={showConfirmation ? 'Sembunyikan password' : 'Tampilkan password'}
              onClick={() => setShowConfirmation(!showConfirmation)}
            >
              {showConfirmation ? <IconEyeOff /> : <IconEye />}
            </button>
          </span>
        </label>
        <label className={styles.terms}>
          <input type="checkbox" required />
          <span>
            Saya menyetujui <a href="/bantuan#syarat">Syarat & Ketentuan</a> dan{' '}
            <a href="/bantuan#privasi">Kebijakan Privasi</a> JokiHub
          </span>
        </label>
        <AuthSubmit>Daftar Sekarang</AuthSubmit>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </form>
    </>
  );
}
