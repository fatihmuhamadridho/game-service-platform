import {
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconShieldCheck,
  IconStarFilled,
  IconUser,
} from '@tabler/icons-react';
import styles from './CategoryList.module.css';

const icons = [
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconShieldCheck,
  IconDeviceGamepad2,
  IconUser,
  IconStarFilled,
  IconStarFilled,
];
type Props = {
  filters: string[];
  counts: Record<string, number>;
  activeFilter: string;
  onSelect: (filter: string) => void;
};
export const CategoryList = ({ filters, counts, activeFilter, onSelect }: Props) => (
  <>
    <h2 className={styles.title}>Kategori</h2>
    <nav className={styles.list} aria-label="Kategori game">
      {filters.map((filter, index) => {
        const Icon = icons[index] ?? IconStarFilled;
        return (
          <button
            className={activeFilter === filter ? styles.active : ''}
            key={filter}
            onClick={() => onSelect(filter)}
          >
            <span>
              <Icon />
              {filter}
            </span>
            <small>{counts[filter]}</small>
          </button>
        );
      })}
    </nav>
  </>
);
