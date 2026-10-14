'use client';

import { useState, type FormEvent } from 'react';
import { IconMail } from '@tabler/icons-react';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';
import styles from '../templates/Auth.module.css';

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/v1/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.status?.message ?? 'Pemulihan password gagal.');
      setNotice(result.status?.message ?? 'Jika email terdaftar, instruksi pemulihan akan dikirim.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Layanan pemulihan belum tersedia.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Email akun</span>
        <span className={styles.inputWrap}>
          <IconMail aria-hidden="true" />
          <input autoComplete="email" name="email" type="email" placeholder="kamu@email.com" required maxLength={254} />
        </span>
      </label>
      <AuthSubmit disabled={busy}>{busy ? 'Mengirim…' : 'Kirim Tautan Pemulihan'}</AuthSubmit>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
