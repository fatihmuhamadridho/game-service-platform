import { IconStarFilled } from '@tabler/icons-react';
import styles from './Rating.module.css';
export const Rating = ({ rating, reviews }: { rating: string; reviews: number }) => (
  <span className={styles.rating}>
    <IconStarFilled /> {rating} <small>({reviews.toLocaleString('id-ID')})</small>
  </span>
);
