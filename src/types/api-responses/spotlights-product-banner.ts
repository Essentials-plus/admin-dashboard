import { Product } from '@/types/api-responses/product';

export type SpotlightsProductBanner = {
  id: string;
  title: string;
  image: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
};
