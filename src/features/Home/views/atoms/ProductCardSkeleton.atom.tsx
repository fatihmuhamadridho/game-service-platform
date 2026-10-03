import { Box } from 'rangkaui';
import styles from './ProductCardSkeleton.module.css';

export const ProductCardSkeleton = () => {
  return (
    <article aria-label="Loading product" aria-busy="true" className={styles.card}>
      <Box className={styles.stack}>
        <div className={styles.media} />

        <Box className={styles.meta}>
          <Box className={styles.metaRow}>
            <Box className={styles.titleStack}>
              <div className={`${styles.shimmer} ${styles.titleShort}`} />
              <div className={`${styles.shimmer} ${styles.titleMid}`} />
            </Box>
            <div className={`${styles.shimmer} ${styles.badge}`} />
          </Box>
          <div className={`${styles.shimmer} ${styles.lineFull}`} />
          <div className={`${styles.shimmer} ${styles.lineWide}`} />
          <div className={`${styles.shimmer} ${styles.lineShort}`} />
        </Box>

        <Box className={styles.footer}>
          <div className={`${styles.shimmer} ${styles.price}`} />
          <div className={`${styles.shimmer} ${styles.stock}`} />
        </Box>
      </Box>
    </article>
  );
};
