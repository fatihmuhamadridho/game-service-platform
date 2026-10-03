import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ProductController } from '@features/Home/domain/product.controller';
import { ProductRequest } from '@features/Home/domain/product.interface';

const productController = new ProductController();
const PRODUCT_QUERY_STALE_TIME = 5 * 60 * 1000;

export const useGetProducts = (params?: ProductRequest.getProducts) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productController.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: PRODUCT_QUERY_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
