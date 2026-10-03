import { BaseResponse } from '@interfaces/base.interface';

export declare namespace ProductResult {
  export type getProducts = BaseResponse<ProductDataProps[], ProductMeta>;
}

export declare namespace ProductResponse {
  export type getProducts = {
    products: ProductDataProps[];
    total: number;
    skip: number;
    limit: number;
  };
}

export declare namespace ProductRequest {
  export type getProducts = {
    limit?: number;
    page?: number;
    name?: string;
    orderBy?: 'name' | 'price' | 'discount';
    sort?: 'ASC' | 'DESC';
    priceFrom?: number;
    priceTo?: number;
    categoryName?: string;
    categoryId?: string;
  };
}

export type ProductMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export interface ProductDataProps {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  image?: string;
  images: string[];
  thumbnail: string;
}
