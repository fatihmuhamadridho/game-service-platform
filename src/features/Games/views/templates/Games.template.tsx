import type { GameCardView } from '../interfaces/game.interface';
import { Header } from '@common-ui/organisms/Header/Header';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { Catalog } from '../organisms/Catalog.organism';
import styles from './Games.module.css';
type Props = {
  loadError: string;
  games: GameCardView[];
  filters: string[];
  counts: Record<string, number>;
  activeFilter: string;
  search: string;
  sort: string;
  page: number;
  onSearch: (value: string) => void;
  onFilter: (filter: string) => void;
  onSort: (value: string) => void;
  onPage: (page: number) => void;
};
export const GamesTemplate = ({
  loadError,
  games,
  filters,
  counts,
  activeFilter,
  search,
  sort,
  page,
  onSearch,
  onFilter,
  onSort,
  onPage,
}: Props) => (
  <main className={styles.page}>
    <Header activePage="games" searchValue={search} onSearchChange={onSearch} />
    {loadError && <p role="alert">{loadError}</p>}
    <Catalog
      games={games}
      filters={filters}
      counts={counts}
      activeFilter={activeFilter}
      search={search}
      sort={sort}
      page={page}
      filtersExpanded={true}
      onSearch={onSearch}
      onFilter={onFilter}
      onSort={onSort}
      onPage={onPage}
    />
    <Footer />
  </main>
);
