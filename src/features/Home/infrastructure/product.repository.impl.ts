import { ProductRepository } from '@features/Home/domain/product.repository';
import { ProductRequest, ProductResponse } from '@features/Home/domain/product.interface';
import { FetchService } from '@services/fetch.service';
import { handleHttpError } from '@utils/handleHttpError.util';

type HttpErrorLike = Parameters<typeof handleHttpError>[0];

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly fetchService: FetchService) {}

  async getProducts(params?: ProductRequest.getProducts): Promise<ProductResponse.getProducts> {
    try {
      const limit = params?.limit;
      const page = params?.page ?? 1;
      const skip = limit === undefined ? undefined : Math.max(0, (page - 1) * limit);
      const search = params?.name?.trim();
      const category = params?.categoryName?.trim();
      const path = search ? '/products/search' : category ? `/products/category/${encodeURIComponent(category)}` : '/products';
      const query = new URLSearchParams();

      if (search) query.set('q', search);
      if (limit !== undefined) query.set('limit', String(limit));
      if (skip !== undefined) query.set('skip', String(skip));
      if (params?.orderBy) {
        const sortBy = {
          name: 'title',
          price: 'price',
          discount: 'discountPercentage',
        }[params.orderBy];
        query.set('sortBy', sortBy);
      }
      if (params?.sort) query.set('order', params.sort.toLowerCase());

      const response = await this.fetchService.get<ProductResponse.getProducts>(`${path}${query.size ? `?${query.toString()}` : ''}`);
      return response;
    } catch (error) {
      throw handleHttpError(error as HttpErrorLike, 'Something went wrong');
    }
  }
}
