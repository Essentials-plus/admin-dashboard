import { Meal } from '@/types/api-responses/meal';

export type WeeklyMeal = {
  id: string;
  week: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WeeklyMealWithMeals = {
  meals: Meal[];
} & WeeklyMeal;
