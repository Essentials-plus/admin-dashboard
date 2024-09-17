import {
  ProductAttribute,
  ProductAttributeTerm,
  ProductVariation,
} from '@/types/api-responses/product-attribute';

/* eslint-disable no-unused-vars */
export enum ProductTypeEnum {
  simple = 'simple',
  variable = 'variable',
}
export enum ProductTaxPercentEnum {
  TAX9 = 'TAX9',
  TAX21 = 'TAX21',
}
export type ProductTaxPercentType = keyof typeof ProductTaxPercentEnum;
export type ProductType = keyof typeof ProductTypeEnum;

export type Product = {
  type: ProductType;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  description: string | null;
  longDescription: string | null;
  faqs?:
    | {
        id: string;
        title: string;
        content: string;
      }[]
    | undefined;
  specs?:
    | {
        value: string;
        id: string;
        label: string;
      }[]
    | undefined;
  taxPercent: ProductTaxPercentType;
  salePrice: number | null;
  showOnHomePageBanner: boolean;
  linkedProducts: Product[];
  regularPrice: number | null;
  images: string[];
  stock: number | null;
  lowStockThreshold: number | null;
  attributes?: ProductAttribute[];
  attributeTerms?: ProductAttributeTerm[];
  variations?: ProductVariation[];
  categoryId?: string | null;
};
