import { Box } from 'rangkaui';
import { getGameArtworkPath } from '@utils/game-artwork';
import { GameArtworkImage } from '@common-ui/atoms/GameArtworkImage/GameArtworkImage.atom';
import type { GameCardView } from '../interfaces/game.interface';
import { GameTag } from '../atoms/GameTag.atom';
import { Rating } from '../atoms/Rating.atom';
import styles from './GameCard.module.css';

export const GameCard = ({ game }: { game: GameCardView }) => {
  const artwork = getGameArtworkPath(game.art);

  return (
    <Box className={styles.card} bordered rounded>
      <a href={`/order?game=${encodeURIComponent(game.slug ?? game.name.toLowerCase().replaceAll(' ', '-'))}`}>
        <div className={`${styles.art} ${styles[game.art]} ${artwork ? styles.withImage : ''}`} aria-hidden="true">
          {artwork ? (
            <GameArtworkImage src={artwork} sizes="(max-width: 680px) 82px, 240px" />
          ) : (
            <>
              <span>{game.name}</span>
              <i />
            </>
          )}
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
            {game.rating && <Rating rating={game.rating} reviews={game.reviews} />}
          </div>
        </div>
      </a>
    </Box>
  );
};
