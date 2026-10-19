'use client';

import { useState, type FormEvent } from 'react';
import { IconEye, IconEyeOff, IconLock, IconUser } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';
import { useRouter } from 'next/navigation';
import { FEATURE_PASSWORD_RECOVERY } from '@configs/base.config';

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get('identifier') ?? '').trim();
    try {
      const response = await fetch('/api/auth/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: String(form.get('password') ?? '') }),
      });
      const result = await response.json();
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        setNotice(
          retryAfter
            ? `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.`
            : (result.status?.message ?? 'Terlalu banyak percobaan. Coba lagi setelah jeda.')
        );
        return;
      }
      if (!response.ok) throw new Error(result.status?.message ?? 'Email/username atau password salah.');
      const accountType = result.data?.accountType === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
      window.sessionStorage.setItem('jokihub-session-type', accountType);
      window.dispatchEvent(new CustomEvent('jokihub:session-established', { detail: accountType }));
      router.replace(accountType === 'ADMIN' ? '/admin' : '/');
    } catch {
      setNotice('Username/email atau password salah, atau layanan sedang tidak tersedia.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Username atau email</span>
          <span className={styles.inputWrap}>
            <IconUser aria-hidden="true" />
            <input
              autoComplete="username"
              name="identifier"
              type="text"
              placeholder="Username atau kamu@email.com"
              required
            />
          </span>
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <span className={styles.inputWrap}>
            <IconLock aria-hidden="true" />
            <input
              autoComplete="current-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
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
        {FEATURE_PASSWORD_RECOVERY && (
          <button type="button" className={styles.forgot} onClick={() => router.push('/forgot-password')}>
            Lupa password?
          </button>
        )}
        <AuthSubmit disabled={busy}>{busy ? 'Memeriksa…' : 'Masuk'}</AuthSubmit>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </form>
    </>
  );
}
