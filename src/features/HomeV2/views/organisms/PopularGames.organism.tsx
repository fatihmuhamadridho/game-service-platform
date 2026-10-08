import type { HomeGame } from '../interfaces/homeV2.interface';
import { SectionHeading } from '../atoms/SectionHeading.atom';
import { GameCard } from '../molecules/GameCard.molecule';
import styles from './PopularGames.module.css';

export const PopularGames = ({ games }: { games: HomeGame[] }) => (
  <section className={styles.section} id="game">
    <SectionHeading
      title="Game Populer"
      description="Pilih game favorit kamu dan nikmati layanan joki maupun top up dengan proses cepat."
      href="/games"
      linkLabel="Lihat Semua"
    />
    <div className={styles.grid}>
      {games.map((game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </div>
  </section>
);
