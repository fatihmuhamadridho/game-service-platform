'use client';

import { useState, type FormEvent } from 'react';
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    const formData = new FormData(form);
    setBusy(true);
    try {
      const response = await fetch('/api/auth/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
          termsAccepted:
            form.querySelector('input[type="checkbox"]') instanceof HTMLInputElement &&
            (form.querySelector('input[type="checkbox"]') as HTMLInputElement).checked,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.status?.message ?? 'Pendaftaran gagal.');
      window.sessionStorage.setItem('jokihub-session-type', 'CUSTOMER');
      window.dispatchEvent(new CustomEvent('jokihub:session-established', { detail: 'CUSTOMER' }));
      router.replace('/');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Layanan pendaftaran sedang tidak tersedia.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Nama Lengkap</span>
          <span className={styles.inputWrap}>
            <IconUser aria-hidden="true" />
            <input autoComplete="name" name="name" placeholder="Contoh: Budi Santoso" required />
          </span>
        </label>
        <label className={styles.field}>
          <span>Username</span>
          <span className={styles.inputWrap}>
            <IconUser aria-hidden="true" />
            <input
              autoComplete="username"
              name="username"
              placeholder="contoh: budi.santoso"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9._-]+"
              required
            />
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
          <span>Password</span>
          <span className={styles.inputWrap}>
            <IconLock aria-hidden="true" />
            <input
              autoComplete="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Buat password (minimal 8 karakter)"
              minLength={8}
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
              minLength={8}
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
        <AuthSubmit disabled={busy}>{busy ? 'Membuat akun…' : 'Daftar Sekarang'}</AuthSubmit>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </form>
    </>
  );
}
