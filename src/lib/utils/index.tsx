import envs from '@/config/envs';
import { mealTypeOptions } from '@/constants/meal';
import { Order } from '@/types/api-responses/order';
import { ProductTaxPercentType } from '@/types/api-responses/product';
import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';
import { ZodError } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isPathEqual = (path1: string, path2: string) => {
  const path_1 = path1.split('?')[0].replace('#', '');
  const path_2 = path2.split('?')[0].replace('#', '');

  return path_1 === path_2;
};

export const getApiErrorMessage = (
  error: any,
  fallbackErrorMessage?: string
) => {
  const defaultErrorMessage =
    fallbackErrorMessage || 'Something went wrong. Please try again.';
  try {
    if (error instanceof ZodError) {
      try {
        const errors = normalizeZodError(error);
        return (
          <ul className="space-y-2 pl-3">
            <li className="text-base font-medium text-red-500">
              Validation error:
            </li>
            {errors.map((error) => (
              <li className="list-item list-disc" key={error.field}>
                <span className="font-medium">
                  {error.field} {'->'}
                </span>{' '}
                <span className="opacity-80">{error.message}</span>
              </li>
            ))}
          </ul>
        );
      } catch (error) {
        return defaultErrorMessage;
      }
    }

    let errorMessage = defaultErrorMessage;
    if (
      Array.isArray(error.response?.data?.issues) &&
      error.response?.data?.issues?.length > 0
    ) {
      return (
        <ul className="space-y-2 pl-3">
          <li className="text-base font-medium text-red-500">
            Backend validation error:
          </li>
          {error.response?.data?.issues.map((issue: any) => (
            <li key={issue.field} className="list-item list-disc">
              <span className="font-medium">
                {issue.field} {'->'}
              </span>{' '}
              <span className="opacity-80">{issue.message}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      try {
        errorMessage = error.response.data.message;
      } catch (error) {}
    }

    return errorMessage;
  } catch (error) {}
};

export const normalizeZodError = (errors: ZodError) => {
  return errors.errors.map((error) => ({
    field: error.path.join('.'),
    message: `${error.message}`,
  }));
};

export const extractQueryKey = (
  queryOptionsFn: () => {
    queryKey: any[];
  }
) => {
  return queryOptionsFn().queryKey.filter(Boolean);
};

export const formatCount = (count: number, text: string) => {
  return text
    .replace('$', count.toString())
    .replace('$$', count <= 1 ? '' : `s`);
};

export const slugifyString = (string: string) => {
  return slugify(string, {
    lower: true,
    trim: true,
  });
};

export const appDefaultDateFormatter = (date: Date) => {
  return format(date, "eeee, dd-MM-yyyy 'at' hh:mm a");
};

export const getProductPrice = (
  product: Order['products'][number]['product'],
  variationId: string | null
) => {
  if (variationId) {
    const variation = product.variations.find(
      (variation) => variation.id === variationId
    );
    return typeof variation?.salePrice === 'number'
      ? variation?.salePrice
      : variation?.regularPrice;
  } else {
    return typeof product.salePrice === 'number'
      ? product.salePrice
      : product.regularPrice;
  }
};

export const sumOf = <T, K extends keyof T>(array: T[], key: K) => {
  return array.reduce((previousValue, currentItem) => {
    return previousValue + currentItem[key as never];
  }, 0);
};

export function sortMealsByMealType<T>(meals: T[]): T[] {
  const order = mealTypeOptions.map((option) => option.value);

  if (!Array.isArray(meals)) return meals;

  return meals?.sort((a: any, b: any) => {
    return order.indexOf(a.meal) - order.indexOf(b.meal);
  });
}

export const getShippingAmount = (amount: number) => {
  const minimumOrderValueForFreeShipping = Number(
    envs.MINIMUM_ORDER_VALUE_FOR_FREE_SHIPPING
  );
  const shippingCharge = Number(envs.SHIPPING_CHARGE);

  if (amount < minimumOrderValueForFreeShipping) {
    return shippingCharge;
  }
  return 0;
};

export const getProductTaxAmount = ({
  productPrice,
  taxPercent,
}: {
  productPrice: number;
  taxPercent: ProductTaxPercentType;
}) => {
  const taxAmount = Number(taxPercent.split('TAX')[1]);

  if (typeof taxAmount !== 'number') return 0;

  if (typeof productPrice !== 'number') return 0;

  return (productPrice / 100) * taxAmount;
};

export const calculateUserCalorie = (user: {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: '1.2' | '1.375' | '1.55' | '1.75' | '1.9';
  goal: '0' | '-500' | '500';
}) => {
  const { weight, height, age, gender, activityLevel, goal } = user;
  if (weight && height && age && gender && activityLevel && goal) {
    const s = gender === 'male' ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + s;
    const factor = bmr * Number(activityLevel);
    return factor + Number(goal);
  } else {
    return null;
  }
};
