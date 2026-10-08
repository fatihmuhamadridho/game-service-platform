import { GameSearch } from '../molecules/GameSearch.molecule';
import { CategoryList } from '../molecules/CategoryList.molecule';
import styles from './GameSidebar.module.css';
type Props = {
  search: string;
  onSearch: (value: string) => void;
  filters: string[];
  counts: Record<string, number>;
  activeFilter: string;
  onSelect: (filter: string) => void;
};
export const GameSidebar = ({ search, onSearch, filters, counts, activeFilter, onSelect }: Props) => (
  <aside className={styles.sidebar}>
    <GameSearch value={search} onChange={onSearch} />
    <CategoryList filters={filters} counts={counts} activeFilter={activeFilter} onSelect={onSelect} />
  </aside>
);
