/* eslint-disable no-unused-vars */
export enum MealTypeEnum {
  breakfast = 'breakfast',
  dinner = 'dinner',
  lunch = 'lunch',
  snacks1 = 'snacks1',
  snacks2 = 'snacks2',
  snacks3 = 'snacks3',
}

export type MealType = keyof typeof MealTypeEnum;

export enum MealTaxPercentEnum {
  TAX9 = 'TAX9',
}
export type MealTaxPercentType = keyof typeof MealTaxPercentEnum;

export const mealTypeArray = [
  'breakfast',
  'dinner',
  'lunch',
  'snacks1',
  'snacks2',
  'snacks3',
] as const;

export type Meal = {
  preparationMethod: {
    id: string;
    label: string;
    mealId: string;
  }[];
  tips: {
    id: string;
    label: string;
    mealId: string;
  }[];
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: 'gr';
    kcal: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
  }[];
  id: string;
  meal: MealTypeEnum;
  mealNumber: string;
  mealName: string;
  cookingTime: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  taxPercent: MealTaxPercentType;
  label: string | null;
  subLabel: string | null;
  shortDescription: string | null;
};
