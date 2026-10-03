import { Box } from 'rangkaui';
import styles from './ProductGrid.module.css';
import { ProductCard } from '../atoms/ProductCard.atom';
import { ProductCardSkeleton } from '../atoms/ProductCardSkeleton.atom';
import type { ProductCardView } from '../interfaces/product.interface';

type ProductGridProps = {
  products: ProductCardView[];
  isLoading?: boolean;
  isFetching?: boolean;
};

export const ProductGrid = ({ products, isLoading, isFetching }: ProductGridProps) => {
  if (isLoading || isFetching) {
    return (
      <Box className={styles.grid}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </Box>
    );
  }

  return (
    <Box className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
};
