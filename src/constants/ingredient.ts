import { IngredientUnitType } from '@/types/api-responses/ingredient';

export const ingredientsUnityTypeOptions: {
  value: IngredientUnitType;
  label: string;
}[] = [
  {
    label: 'gr',
    value: 'gr',
  },
  {
    label: 'ml',
    value: 'ml',
  },
  {
    label: 'por',
    value: 'por',
  },
  {
    label: 'pc',
    value: 'pc',
  },
];
