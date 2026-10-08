import { Box } from 'rangkaui';
import type { GameCardView } from '../interfaces/game.interface';
import { GameTag } from '../atoms/GameTag.atom';
import { Rating } from '../atoms/Rating.atom';
import styles from './GameCard.module.css';

const slug = (name: string) => name.toLowerCase().replaceAll(' ', '-');
export const GameCard = ({ game }: { game: GameCardView }) => (
  <Box className={styles.card} bordered rounded>
    <a href={`/order/${slug(game.name)}`}>
      <div className={`${styles.art} ${styles[game.art]}`}>
        <span>{game.name}</span>
        <i />
      </div>
      <div className={styles.body}>
        <h3>{game.name}</h3>
        <div className={styles.tags}>
          {game.tags.map((tag) => (
            <GameTag key={tag}>{tag}</GameTag>
          ))}
        </div>
        <div className={styles.meta}>
          <span>{game.count} layanan</span>
          <Rating rating={game.rating} reviews={game.reviews} />
        </div>
      </div>
    </a>
  </Box>
);
