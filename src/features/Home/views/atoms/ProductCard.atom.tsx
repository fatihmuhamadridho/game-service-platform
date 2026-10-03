import { Box } from 'rangkaui';
import styles from './ProductCard.module.css';
import type { ProductCardView } from '../interfaces/product.interface';

type ProductCardProps = {
  product: ProductCardView;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className={styles.card}>
      <Box className={styles.stack}>
        <img
          alt={product.title}
          src={product.thumbnail || product.images?.[0] || ''}
          className={styles.media}
        />

        <Box className={styles.meta}>
          <Box className={styles.metaRow}>
            <p className={styles.title}>{product.title}</p>
            <span className={styles.category}>{product.category}</span>
          </Box>
          <p className={styles.description}>{product.description}</p>
        </Box>

        <Box className={styles.footer}>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <p className={styles.stock}>Stock {product.stock}</p>
        </Box>
      </Box>
    </article>
  );
};
