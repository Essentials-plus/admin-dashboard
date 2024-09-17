import { PlanOrderStatus } from '@/types/api-responses/meal-orders';

export const mealOrderStatusOptions: {
  value: PlanOrderStatus;
  label: string;
}[] = [
  {
    label: 'Confirmed',
    value: 'confirmed',
  },
  {
    label: 'Delivered',
    value: 'delivered',
  },
];
