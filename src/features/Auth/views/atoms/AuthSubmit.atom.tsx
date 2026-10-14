import type { ReactNode } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';

export function AuthSubmit({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button className={styles.submit} type="submit" disabled={disabled}>
      {children}
      <IconArrowRight aria-hidden="true" />
    </button>
  );
}
