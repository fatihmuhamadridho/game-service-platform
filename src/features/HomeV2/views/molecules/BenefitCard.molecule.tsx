import { Box } from 'rangkaui';
import type { HomeBenefit } from '../interfaces/homeV2.interface';
import styles from './BenefitCard.module.css';

export const BenefitCard = ({ item }: { item: HomeBenefit }) => (
  <Box className={styles.card} bordered rounded>
    <span className={styles.icon}>{item.icon}</span>
    <span>
      <b>{item.title}</b>
      <small>{item.detail}</small>
    </span>
  </Box>
);
