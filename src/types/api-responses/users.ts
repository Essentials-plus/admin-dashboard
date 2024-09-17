import { PlanStatus } from '@/types/api-responses/meal-orders';

/* eslint-disable no-unused-vars */
export enum UserGenderEnum {
  male = 'male',
  female = 'female',
  others = 'others',
}
export enum UserStatusEnum {
  active = 'active',
  blocked = 'blocked',
}

export type UserGender = keyof typeof UserGenderEnum;

export type UserStatus = keyof typeof UserStatusEnum;

export type UserPlan = {
  id: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
  numberOfDays: number;
  mealsPerDay: number;
  confirmOrderWeek: number | null;
  userId: string;
} | null;

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  status: UserStatusEnum;
  profile: string | null;
  surname: string | null;
  age: number | null;
  gender: UserGenderEnum | null;
  weight: number | null;
  height: number | null;
  activityLevel: string | null;
  goal: string | null;
  address: string | null;
  nr: string | null;
  addition: string | null;
  city: string | null;
  zipCode?: {
    zipCode: string;
    id: string;
    lockdownDay: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  mobile: string | null;
  customer: string | null;
  verified: boolean;
};
