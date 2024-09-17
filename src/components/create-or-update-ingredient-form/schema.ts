import {
  Ingredient,
  IngredientUnitTypeEnum,
} from '@/types/api-responses/ingredient';
import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().min(1),
  unit: z.nativeEnum(IngredientUnitTypeEnum),
  kcal: z.number().min(0),
  proteins: z.number().min(0),
  carbohydrates: z.number().min(0),
  fats: z.number().min(0),
  fiber: z.number().min(0),
  categoryId: z.string().optional().nullable(),
});

export type CreateIngredientSchema = z.infer<typeof createIngredientSchema>;

export type CreateOrUpdateIngredientFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (ingredient: Ingredient) => void;
  onApiError?: () => void;
  ingredientId?: string;
  defaultInitialValues?: Partial<CreateIngredientSchema>;
};
