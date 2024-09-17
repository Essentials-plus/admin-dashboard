/* eslint-disable no-unused-vars */
export enum IngredientUnitTypeEnum {
  gr = 'gr',
  ml = 'ml',
  por = 'por',
  pc = 'pc',
}

export type IngredientUnitType = keyof typeof IngredientUnitTypeEnum;

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnitType;
  kcal: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  categoryId: string | null;
};
