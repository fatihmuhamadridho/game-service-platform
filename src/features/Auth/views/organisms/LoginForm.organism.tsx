'use client';

import { useState, type FormEvent } from 'react';
import { IconBrandWhatsapp, IconEye, IconEyeOff, IconLock, IconMail } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';
import { AuthSubmit } from '../atoms/AuthSubmit.atom';

export function LoginForm() {
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Fitur masuk akun akan tersedia setelah layanan autentikasi terhubung.');
  }
  return (
    <>
      <div className={styles.cardHeading}>
        <h2 id="form-title">Masuk ke Akun</h2>
        <p>Masukkan informasi akun kamu untuk melanjutkan</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.methodTabs} role="tablist" aria-label="Metode masuk">
          <button
            type="button"
            role="tab"
            aria-selected={method === 'email'}
            className={method === 'email' ? styles.activeTab : ''}
            onClick={() => setMethod('email')}
          >
            <IconMail /> Email
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === 'whatsapp'}
            className={method === 'whatsapp' ? styles.activeTab : ''}
            onClick={() => setMethod('whatsapp')}
          >
            <IconBrandWhatsapp /> No. WhatsApp
          </button>
        </div>
        <label className={styles.field}>
          <span>{method === 'whatsapp' ? 'No. WhatsApp' : 'Email'}</span>
          <span className={styles.inputWrap}>
            {method === 'whatsapp' ? <IconBrandWhatsapp aria-hidden="true" /> : <IconMail aria-hidden="true" />}
            <input
              autoComplete={method === 'whatsapp' ? 'tel' : 'email'}
              name={method === 'whatsapp' ? 'phone' : 'email'}
              type={method === 'whatsapp' ? 'tel' : 'email'}
              placeholder={method === 'whatsapp' ? '81234567890' : 'contoh: kamu@email.com'}
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
        <button
          type="button"
          className={styles.forgot}
          onClick={() => setNotice('Pemulihan akun akan tersedia setelah layanan autentikasi terhubung.')}
        >
          Lupa password?
        </button>
        <AuthSubmit>Masuk</AuthSubmit>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </form>
    </>
  );
}
