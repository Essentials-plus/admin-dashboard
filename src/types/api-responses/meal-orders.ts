import { User } from '@/types/api-responses/users';

/* eslint-disable no-unused-vars */

export enum PlanStatusEnum {
  pending = 'pending',
  active = 'active',
  canceled = 'canceled',
}

export enum PlanOrderStatusEnum {
  confirmed = 'confirmed',
  delivered = 'delivered',
}

export type PlanStatus = keyof typeof PlanStatusEnum;
export type PlanOrderStatus = keyof typeof PlanOrderStatusEnum;

export type MealOrder = {
  plan: {
    user: User;
  } | null;
  mealsForTheWeek: {
    day: number;
    meals: {
      id: string;
      ingredients: {
        id: string;
        totalNeed: number;
        name?: string;
        quantity?: number;
        unit?: 'gr' | 'ml' | 'por' | 'pc';
        kcal?: number;
        proteins?: number;
        carbohydrates?: number;
        fats?: number;
        fiber?: number;
      }[];
      kCalNeed: number;
      totalNeedOfKCal: number;
      totalNeedOfProteins: number;
      totalNeedOfCarbohydrates: number;
      totalNeedOfFats: number;
      totalNeedOfFiber: number;
      meal?:
        | 'breakfast'
        | 'dinner'
        | 'lunch'
        | 'snacks1'
        | 'snacks2'
        | 'snacks3';
      mealNumber?: string;
      mealName?: string;
      preparationMethod?:
        | {
            label: string;
          }[]
        | undefined;
      cookingTime?: string;
      tips?:
        | {
            label: string;
          }[]
        | undefined;
      image?: string;
    }[];
    id?: string;
  }[];
  id: string;
  shippingAmount: number;
  totalAmount: number;
  week: number;
  createdAt: Date;
  updatedAt: Date;
  planId: string | null;
  status: PlanOrderStatusEnum;
};
export type MealOrderSummary = Pick<
  MealOrder,
  'id' | 'status' | 'week' | 'plan' | 'createdAt' | 'totalAmount'
>;
