import { Box } from 'rangkaui';
import type { CheckoutGame } from '../interfaces/checkout.interface';
import { PanelHeading } from '../atoms/PanelHeading.atom';
import { GameChoice } from '../molecules/GameChoice.molecule';
import styles from './GamePicker.module.css';
type Props = { games: CheckoutGame[]; selected: string; onSelect: (game: string) => void };
export const GamePicker = ({ games, selected, onSelect }: Props) => (
  <Box className={styles.panel} bordered rounded>
    <PanelHeading number="1" title="Pilih Game" description="Pilih game yang ingin kamu gunakan." />
    <div className={styles.picker}>
      {games.map((game) => (
        <GameChoice
          key={game.name}
          game={game}
          selected={selected === game.name}
          onSelect={() => onSelect(game.name)}
        />
      ))}
    </div>
  </Box>
);
