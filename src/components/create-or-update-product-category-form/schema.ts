import { ProductCategory } from '@/types/api-responses/product-category';
import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().trim().optional().nullable(),
  image: z.any(),
  parentCategoryId: z.string().uuid().optional().nullable(),
});

export type CreateProductCategorySchema = z.infer<
  typeof createProductCategorySchema
>;

export type CreateOrUpdateProductCategoryFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (productCategory?: ProductCategory) => void;
  onApiError?: () => void;
  categoryId?: string;
};
