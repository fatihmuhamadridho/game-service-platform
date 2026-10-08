import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import styles from './GameSearch.module.css';

type Props = { value: string; onChange: (value: string) => void; onFilterToggle?: () => void };
export const GameSearch = ({ value, onChange, onFilterToggle }: Props) => (
  <>
    <label className={styles.headerSearch}>
      <IconSearch />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Cari game atau layanan..." />
      <kbd>Ctrl K</kbd>
    </label>
    <div className={styles.mobileSearch}>
      <IconSearch />
      <input
        id="mobile-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari game..."
      />
      <button aria-label="Filter game" onClick={onFilterToggle}>
        <IconAdjustmentsHorizontal />
      </button>
    </div>
    <label className={styles.sideSearch}>
      Cari Game
      <div>
        <IconSearch />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Cari game..." />
      </div>
    </label>
  </>
);
