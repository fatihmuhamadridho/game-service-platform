'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useState, type FormEvent } from 'react';
import { IconLock } from '@tabler/icons-react';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';
import styles from '../templates/Auth.module.css';

export function ResetPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const form = event.currentTarget;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const confirmation = form.elements.namedItem('password-confirmation') as HTMLInputElement;
    if (password.value !== confirmation.value) {
      setBusy(false);
      setNotice('Konfirmasi password belum sama.');
      return;
    }
    const token = new URLSearchParams(window.location.search).get('token') ?? '';
    try {
      const response = await apiFetch('/api/auth/v1/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: password.value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.status?.message ?? 'Password gagal diubah.');
      setCompleted(true);
      setNotice(result.status?.message ?? 'Password berhasil diubah. Silakan masuk kembali.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Layanan reset password sedang tidak tersedia.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Password baru</span>
        <span className={styles.inputWrap}>
          <IconLock aria-hidden="true" />
          <input autoComplete="new-password" name="password" type="password" minLength={8} maxLength={128} required />
        </span>
      </label>
      <label className={styles.field}>
        <span>Konfirmasi password</span>
        <span className={styles.inputWrap}>
          <IconLock aria-hidden="true" />
          <input
            autoComplete="new-password"
            name="password-confirmation"
            type="password"
            minLength={8}
            maxLength={128}
            required
          />
        </span>
      </label>
      {!completed && <AuthSubmit disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Password Baru'}</AuthSubmit>}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
