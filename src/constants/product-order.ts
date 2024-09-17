import { OrderStatus } from '@/types/api-responses/order';

export const productOrderStatusOptions: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    label: 'Processing',
    value: 'processing',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
  // {
  //   label: 'Unpaid',
  //   value: 'unpaid',
  // },
];
