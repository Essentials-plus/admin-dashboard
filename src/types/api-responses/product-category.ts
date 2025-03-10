export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  parentCategory: ProductCategory | null;
  subCategories: ProductCategory[];
  parentCategoryId: string | null;
};
