import { IconChevronRight } from '@tabler/icons-react';
import styles from './Breadcrumb.module.css';
type Props = { game: string };
export const Breadcrumb = ({ game }: Props) => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <a href="/homepagev2">Beranda</a>
    <IconChevronRight />
    <a href="/games">Shop</a>
    <IconChevronRight />
    <span>{game}</span>
    <IconChevronRight />
    <b>Pesan</b>
  </nav>
);
