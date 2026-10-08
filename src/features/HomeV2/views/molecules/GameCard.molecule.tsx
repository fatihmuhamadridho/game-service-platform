import { Box } from 'rangkaui';
import type { HomeGame } from '../interfaces/homeV2.interface';
import styles from './GameCard.module.css';

export const GameCard = ({ game }: { game: HomeGame }) => (
  <Box className={styles.card} bordered rounded>
    <a href={`/order/${game.name.toLowerCase().replaceAll(' ', '-')}`}>
      <div className={`${styles.art} ${styles[game.art]}`}>
        <span>{game.mark}</span>
        <i />
        <b />
      </div>
      <strong>{game.name}</strong>
      <small>{game.service}</small>
    </a>
  </Box>
);
