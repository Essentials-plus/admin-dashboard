import { MealTaxPercentType, MealType } from '@/types/api-responses/meal';

export const mealTypeOptions: {
  value: MealType;
  label: string;
}[] = [
  {
    label: 'Ontbijt',
    value: 'breakfast',
  },
  {
    label: 'Snacks 1',
    value: 'snacks1',
  },
  {
    label: 'Lunch',
    value: 'lunch',
  },
  {
    label: 'Snacks 2',
    value: 'snacks2',
  },
  {
    label: 'Diner',
    value: 'dinner',
  },
  {
    label: 'Snacks 3',
    value: 'snacks3',
  },
];

export const mealTaxPercentOptions: {
  value: MealTaxPercentType;
  label: string;
}[] = [
  {
    label: '9%',
    value: 'TAX9',
  },
];
