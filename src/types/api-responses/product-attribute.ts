export type ProductAttribute = {
  productId: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
};

export type ProductAttributeTerm = {
  id: string;
  name: string;
  slug: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  productAttributeId: string;
  productVariationId: string | null;
};

export type ProductAttributeTerms = ProductAttribute & {
  terms: ProductAttributeTerm[];
};

export type ProductVariation = {
  id: string;
  salePrice: number | null;
  regularPrice: number | null;
  stock: number | null;
  lowStockThreshold: number | null;
  createdAt: Date;
  updatedAt: Date;
  productId: string | null;
  termIds: string[];
  image: string | null;
};
