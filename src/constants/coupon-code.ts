import {
  CouponPolicy,
  CouponStatus,
  CouponType,
} from '@/types/api-responses/coupon-code';

export const couponTypeOptions: {
  value: CouponType;
  label: string;
}[] = [
  {
    label: 'Amount',
    value: 'amount',
  },
  {
    label: 'Percent',
    value: 'percent',
  },
];

export const couponPolicyOptions: {
  value: CouponPolicy;
  label: string;
}[] = [
  {
    label: 'Multiple',
    value: 'multiple',
  },
  {
    label: 'Onetime',
    value: 'onetime',
  },
];

export const couponStatusOptions: {
  value: CouponStatus;
  label: string;
}[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Inactive',
    value: 'inactive',
  },
];
