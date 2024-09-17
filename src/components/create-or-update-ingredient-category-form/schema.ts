import { IngredientCategory } from '@/types/api-responses/ingredient-category';
import { z } from 'zod';

export const createIngredientCategorySchema = z.object({
  name: z.string().min(1),
});

export type CreateIngredientCategorySchema = z.infer<
  typeof createIngredientCategorySchema
>;

export type CreateOrUpdateIngredientCategoryFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (productCategory?: IngredientCategory) => void;
  onApiError?: () => void;
  categoryId?: string;
};
