import { FilterChip } from '../molecules/FilterChip.molecule';
import styles from './FilterBar.module.css';
type Props = { filters: string[]; activeFilter: string; expanded: boolean; onChoose: (filter: string) => void };
export const FilterBar = ({ filters, activeFilter, expanded, onChoose }: Props) => (
  <nav className={`${styles.bar} ${expanded ? styles.expanded : ''}`} aria-label="Filter kategori game">
    {filters.map((filter, index) => (
      <FilterChip
        key={filter}
        label={filter}
        index={index}
        active={activeFilter === filter}
        onClick={() => onChoose(filter)}
      />
    ))}
  </nav>
);
