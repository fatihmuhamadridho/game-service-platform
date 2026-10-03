import { Box } from 'rangkaui';

export const ProductCardSkeleton = () => {
  return (
    <article className="product-card-skeleton">
      <Box className="product-card-skeleton-stack">
        <div className="skeleton-media skeleton-pulse" />

        <Box className="product-card-meta">
          <Box className="product-card-meta-row">
            <Box className="skeleton-title-stack">
              <div className="skeleton-line skeleton-line-short skeleton-pulse" />
              <div className="skeleton-line skeleton-line-mid skeleton-pulse" />
            </Box>
            <div className="skeleton-badge skeleton-pulse" />
          </Box>

          <div className="skeleton-line skeleton-line-full skeleton-pulse" />
          <div className="skeleton-line skeleton-line-wide skeleton-pulse" />
          <div className="skeleton-line skeleton-line-short skeleton-pulse" />
        </Box>

        <Box className="product-card-footer">
          <div className="skeleton-price skeleton-pulse" />
          <div className="skeleton-stock skeleton-pulse" />
        </Box>
      </Box>
    </article>
  );
};
