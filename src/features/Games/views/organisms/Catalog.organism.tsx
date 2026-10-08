import type { GameCardView } from '../interfaces/game.interface';
import { Breadcrumb } from '../atoms/Breadcrumb.atom';
import { CatalogHeader } from './CatalogHeader.organism';
import { FilterBar } from './FilterBar.organism';
import { GameSidebar } from './GameSidebar.organism';
import { GameResults } from './GameResults.organism';
import styles from './Catalog.module.css';
type Props = {
  games: GameCardView[];
  filters: string[];
  counts: Record<string, number>;
  activeFilter: string;
  search: string;
  sort: string;
  page: number;
  filtersExpanded: boolean;
  onSearch: (value: string) => void;
  onFilter: (filter: string) => void;
  onSort: (value: string) => void;
  onPage: (page: number) => void;
};
export const Catalog = ({
  games,
  filters,
  counts,
  activeFilter,
  search,
  sort,
  page,
  filtersExpanded,
  onSearch,
  onFilter,
  onSort,
  onPage,
}: Props) => (
  <div className={styles.content}>
    <Breadcrumb />
    <CatalogHeader />
    <FilterBar filters={filters} activeFilter={activeFilter} expanded={filtersExpanded} onChoose={onFilter} />
    <div className={styles.layout}>
      <GameSidebar
        search={search}
        onSearch={onSearch}
        filters={filters}
        counts={counts}
        activeFilter={activeFilter}
        onSelect={onFilter}
      />
      <GameResults
        games={games}
        title={activeFilter === 'Semua' && !search ? '24 Game' : `${games.length} Game`}
        sort={sort}
        page={page}
        onSort={onSort}
        onPage={onPage}
      />
    </div>
  </div>
);
