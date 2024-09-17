import {
  ProductTaxPercentType,
  ProductType,
} from '@/types/api-responses/product';

export const productTypeOptions: {
  value: ProductType;
  label: string;
}[] = [
  {
    label: 'Simple',
    value: 'simple',
  },
  {
    label: 'Variable',
    value: 'variable',
  },
];

export const productTaxPercentOptions: {
  value: ProductTaxPercentType;
  label: string;
}[] = [
  {
    label: '9%',
    value: 'TAX9',
  },
  {
    label: '21%',
    value: 'TAX21',
  },
];
