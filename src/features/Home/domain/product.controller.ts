import { ProductRepositoryImpl } from '@features/Home/infrastructure/product.repository.impl';
import { FetchService } from '@services/fetch.service';
import { GetProductsUseCase } from './product.usecase';
import { ProductRequest } from './product.interface';

export class ProductController {
  private readonly fetchService: FetchService;
  private readonly productRepositoryImpl: ProductRepositoryImpl;
  private readonly getProductsUseCase: GetProductsUseCase;

  constructor() {
    this.fetchService = new FetchService();
    this.productRepositoryImpl = new ProductRepositoryImpl(this.fetchService);
    this.getProductsUseCase = new GetProductsUseCase(this.productRepositoryImpl);
  }

  getProducts(params?: ProductRequest.getProducts) {
    return this.getProductsUseCase.execute(params);
  }
}
