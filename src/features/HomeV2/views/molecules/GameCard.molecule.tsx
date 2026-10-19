import { Box } from 'rangkaui';
import { getGameArtworkPath } from '@utils/game-artwork';
import { GameArtworkImage } from '@common-ui/atoms/GameArtworkImage/GameArtworkImage.atom';
import type { HomeGame } from '../interfaces/homeV2.interface';
import styles from './GameCard.module.css';

export const GameCard = ({ game }: { game: HomeGame }) => {
  const artwork = getGameArtworkPath(game.art);

  return (
    <Box className={styles.card} bordered rounded>
      <a href={`/order?game=${encodeURIComponent(game.slug)}`}>
        <div className={`${styles.art} ${styles[game.art]} ${artwork ? styles.withImage : ''}`} aria-hidden="true">
          {artwork ? (
            <GameArtworkImage src={artwork} sizes="(max-width: 700px) 38vw, 160px" />
          ) : (
            <>
              <span>{game.mark}</span>
              <i />
              <b />
            </>
          )}
        </div>
        <strong>{game.name}</strong>
        <small>{game.service}</small>
      </a>
    </Box>
  );
};
