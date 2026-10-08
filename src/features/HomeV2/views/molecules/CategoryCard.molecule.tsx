import { Box } from 'rangkaui';
import type { HomeCategory } from '../interfaces/homeV2.interface';
import styles from './CategoryCard.module.css';

export const CategoryCard = ({ item }: { item: HomeCategory }) => (
  <Box className={styles.card} bordered rounded>
    <a href="#game">
      <span className={styles.icon}>{item.icon}</span>
      <span>
        <b>{item.title}</b>
        <small>{item.detail}</small>
      </span>
    </a>
  </Box>
);
