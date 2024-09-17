import { createIngredientSchema } from '@/components/create-or-update-ingredient-form/schema';
import {
  Meal,
  MealTaxPercentEnum,
  MealTypeEnum,
} from '@/types/api-responses/meal';
import { z } from 'zod';

export const createMealSchema = z.object({
  meal: z.nativeEnum(MealTypeEnum),
  mealNumber: z.string(),
  mealName: z.string().min(5),
  preparationMethod: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string(),
    })
  ),
  cookingTime: z.string().min(1),
  tips: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string(),
    })
  ),
  image: z.string().optional(),
  ingredients: z.array(
    createIngredientSchema
      .omit({
        unit: true,
      })
      .merge(
        z.object({
          id: z.string(),
        })
      )
  ),
  taxPercent: z.nativeEnum(MealTaxPercentEnum),
  shortDescription: z.string().optional(),
  label: z.string().optional(),
  subLabel: z.string().optional(),
});

export type CreateMealSchema = z.infer<typeof createMealSchema>;

export type CreateOrUpdateMealFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (meal: Meal) => void;
  onApiError?: () => void;
  mealId?: string;
  defaultInitialValues?: Partial<CreateMealSchema>;
  hideGoBackButton?: boolean;
};
