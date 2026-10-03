import { Box, Pagination } from 'rangkaui';
import styles from './ProductPagination.module.css';

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
};

export const ProductPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isFetching,
}: ProductPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Box className={styles.wrapper}>
      {isFetching ? <span className={styles.status}>Updating…</span> : null}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={12}
        pageSizeOptions={[12]}
        onPageChange={onPageChange}
        onPageSizeChange={() => undefined}
        className={styles.controls}
      />
    </Box>
  );
};
