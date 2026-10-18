import { IconChevronRight } from '@tabler/icons-react';
import styles from './Breadcrumb.module.css';
export const Breadcrumb = () => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <a href="/">Beranda</a>
    <IconChevronRight />
    <span>Game</span>
  </nav>
);
