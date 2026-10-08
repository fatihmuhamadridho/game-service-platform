import { useState } from 'react';
import { Box } from 'rangkaui';
import { IconShieldCheck } from '@tabler/icons-react';
import { PanelHeading } from '../atoms/PanelHeading.atom';
import { TextField } from '../atoms/TextField.atom';
import styles from './OrderDetailsForm.module.css';
type Props = { errors: string[]; onChange: () => void };
export const OrderDetailsForm = ({ errors, onChange }: Props) => {
  const [phone, setPhone] = useState('');
  return (
    <Box className={styles.panel} bordered rounded>
      <PanelHeading number="3" title="Detail Order" description="Lengkapi informasi akun dan kebutuhan tambahan." />
      <form className={styles.form} id="order-details" onChange={onChange}>
        <TextField
          label="Nama Lengkap"
          name="name"
          error={errors.includes('name') ? 'Nama lengkap wajib diisi.' : undefined}
          inputProps={{ placeholder: 'Contoh: Budi Santoso', autoComplete: 'name' }}
        />
        <label className={`${styles.phoneField} ${errors.includes('phone') ? styles.invalid : ''}`}>
          No. WhatsApp
          <div className={styles.phone}>
            <span>
              +62 <span>⌄</span>
            </span>
            <input
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Contoh: 81234567890"
              inputMode="tel"
              autoComplete="tel-national"
              aria-invalid={errors.includes('phone')}
            />
          </div>
          {errors.includes('phone') && <small className={styles.error}>Nomor WhatsApp wajib diisi.</small>}
        </label>
        <TextField
          label="Username / ID Akun"
          name="account"
          error={errors.includes('account') ? 'Username atau ID akun wajib diisi.' : undefined}
          inputProps={{ placeholder: 'Masukkan username / ID akun' }}
        />
        <TextField label="Server (Opsional)" name="server" inputProps={{ placeholder: 'Contoh: Asia / ID / NA' }} />
        <label className={styles.full}>
          Detail Tambahan (Opsional)
          <textarea name="notes" placeholder="Contoh: target rank, catatan khusus, dll." rows={3} />
        </label>
        <p className={styles.notice}>
          <IconShieldCheck />
          Jangan pernah bagikan password atau kode OTP lewat formulir ini.
        </p>
      </form>
    </Box>
  );
};
