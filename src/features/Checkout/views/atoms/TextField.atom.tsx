import type { InputHTMLAttributes } from 'react';
import styles from './TextField.module.css';
type Props = { label: string; name: string; error?: string; inputProps?: InputHTMLAttributes<HTMLInputElement> };
export const TextField = ({ label, name, error, inputProps = {} }: Props) => (
  <label className={`${styles.field} ${error ? styles.invalid : ''}`}>
    {label}
    <input name={name} aria-invalid={Boolean(error)} {...inputProps} />
    {error && <small>{error}</small>}
  </label>
);
