import { Box } from 'rangkaui';
import type { ProductCardView } from '../interfaces/product.interface';

type ProductCardProps = {
  product: ProductCardView;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="product-card">
      <Box className="product-card-stack">
        <img alt={product.title} className="product-card-media" src={product.thumbnail || product.images?.[0] || ''} />

        <Box className="product-card-meta">
          <Box className="product-card-meta-row">
            <p className="product-card-title">{product.title}</p>
            <span className="product-card-category">
              {product.category}
            </span>
          </Box>
          <p className="product-card-description">{product.description}</p>
        </Box>

        <Box className="product-card-footer">
          <p className="product-card-price">${product.price.toFixed(2)}</p>
          <p className="product-card-stock">Stock {product.stock}</p>
        </Box>
      </Box>
    </article>
  );
};
