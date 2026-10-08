import { IconSearch } from '@tabler/icons-react';
import type { GameCardView } from '../interfaces/game.interface';
import { GameCard } from '../molecules/GameCard.molecule';
import { Pagination } from '../molecules/Pagination.molecule';
import { SortSelect } from '../atoms/SortSelect.atom';
import styles from './GameResults.module.css';
type Props = {
  games: GameCardView[];
  title: string;
  sort: string;
  page: number;
  onSort: (value: string) => void;
  onPage: (page: number) => void;
};
export const GameResults = ({ games, title, sort, page, onSort, onPage }: Props) => (
  <section className={styles.results}>
    <div className={styles.header}>
      <h2>{title}</h2>
      <SortSelect value={sort} onChange={onSort} />
    </div>
    {games.length ? (
      <div className={styles.grid}>
        {games.slice((page - 1) * 12, page * 12).map((game) => (
          <GameCard game={game} key={game.name} />
        ))}
      </div>
    ) : (
      <div className={styles.empty}>
        <IconSearch />
        <b>Game tidak ditemukan</b>
        <span>Coba kata kunci atau kategori lain.</span>
      </div>
    )}
    {games.length > 12 && <Pagination page={page} pageCount={Math.ceil(games.length / 12)} onChange={onPage} />}
  </section>
);
