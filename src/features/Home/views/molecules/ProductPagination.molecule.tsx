import { Box, Pagination } from 'rangkaui';

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
    <Box className="product-pagination">
      {isFetching ? <span className="product-pagination-status">Updating…</span> : null}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={12}
        pageSizeOptions={[12]}
        onPageChange={onPageChange}
        onPageSizeChange={() => undefined}
        className="product-pagination-controls"
      />
    </Box>
  );
};
