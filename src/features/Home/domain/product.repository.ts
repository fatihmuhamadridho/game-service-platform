import { ProductRequest, ProductResponse } from './product.interface';

export abstract class ProductRepository {
  abstract getProducts(params?: ProductRequest.getProducts): Promise<ProductResponse.getProducts>;
}
