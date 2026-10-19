import { IconCheck } from '@tabler/icons-react';
import { getGameArtworkPath } from '@utils/game-artwork';
import { GameArtworkImage } from '@common-ui/atoms/GameArtworkImage/GameArtworkImage.atom';
import type { CheckoutGame } from '../interfaces/checkout.interface';
import styles from './GameChoice.module.css';
type Props = { game: CheckoutGame; selected: boolean; onSelect: () => void };
export const GameChoice = ({ game, selected, onSelect }: Props) => {
  const artwork = getGameArtworkPath(game.art);

  return (
    <button
      className={`${styles.choice} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={`${styles.art} ${styles[game.art]}`} aria-hidden="true">
        {artwork ? <GameArtworkImage src={artwork} sizes="78px" /> : <i>{game.mark}</i>}
      </span>
      <b>{game.name}</b>
      {selected && (
        <span className={styles.check}>
          <IconCheck />
        </span>
      )}
    </button>
  );
};
