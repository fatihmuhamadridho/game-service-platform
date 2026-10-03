import { Box } from 'rangkaui';
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
    <section className="product-list-section">
      <Box className="product-list-intro">
        <p className="product-list-eyebrow">Fake Store API / Products</p>
        <h2 className="product-list-title">
          Products from API
        </h2>
        <p className="product-list-description">
          Data produk sudah diambil lewat flow repository, use case, dan controller di `src/features/Home`.
        </p>
      </Box>

      {isError ? (
        <Box className="product-list-error-card">
          <p className="product-list-error-title">Failed to load products</p>
          <p className="product-list-error-text">{errorMessage || 'Unknown error'}</p>
        </Box>
      ) : null}

      <ProductGrid products={products} isLoading={isLoading} isFetching={isFetching} />

      {totalPages > 1 ? (
        <Box className="product-list-pagination-card">
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
