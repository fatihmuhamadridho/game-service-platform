import type { ReactNode } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';

export function AuthSubmit({ children }: { children: ReactNode }) {
  return (
    <button className={styles.submit} type="submit">
      {children}
      <IconArrowRight aria-hidden="true" />
    </button>
  );
}
