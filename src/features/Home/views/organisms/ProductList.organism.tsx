import { Box } from 'rangkaui';
import styles from './ProductList.module.css';
import { ProductGrid } from '../molecules/ProductGrid.molecule';
import { ProductPagination } from '../molecules/ProductPagination.molecule';
import type { ProductCardView } from '../interfaces/product.interface';

type ProductListProps = {
  products: ProductCardView[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
};

export const ProductList = ({
  products,
  isLoading,
  isError,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  isFetching,
  onPageChange,
}: ProductListProps) => {
  return (
    <section className={styles.section}>
      <Box className={styles.intro}>
        <p className={styles.eyebrow}>DummyJSON / Products</p>
        <h2 className={styles.title}>Products from API</h2>
        <p className={styles.description}>
          Data produk sudah diambil lewat flow repository, use case, dan controller di `src/features/Home`.
        </p>
      </Box>

      {isError ? (
        <Box className={styles.errorCard}>
          <p className={styles.errorTitle}>Failed to load products</p>
          <p className={styles.errorText}>{errorMessage || 'Unknown error'}</p>
        </Box>
      ) : null}

      <ProductGrid products={products} isLoading={isLoading} isFetching={isFetching} />

      {totalPages > 1 ? (
        <Box className={styles.paginationCard}>
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isFetching={isFetching}
            onPageChange={onPageChange}
          />
        </Box>
      ) : null}
    </section>
  );
};
