import { createMealSchema } from '@/components/create-or-update-meal-form/schema';
import { z } from 'zod';

export const createWeeklyMealsSchema = z.object({
  week: z.number().positive().min(1).max(52),
  meals: z.array(
    createMealSchema
      .pick({
        mealName: true,
        meal: true,
      })
      .merge(
        z.object({
          id: z.string().uuid(),
        })
      )
  ),
});

export const updateWeeklyMealsSchema = createWeeklyMealsSchema.omit({
  week: true,
});

export type CreateWeeklyMealsSchema = z.infer<typeof createWeeklyMealsSchema>;
export type UpdateWeeklyMealsSchema = z.infer<typeof updateWeeklyMealsSchema>;

export type CreateOrUpdateWeeklyMealsFormProps = {
  onCreateOrUpdate?: () => void;
  onApiError?: () => void;
  weekId?: string;
};
