/* eslint-disable no-unused-vars */
import {
  CouponPolicyEnum,
  CouponStatusEnum,
  CouponTypeEnum,
} from '@/types/api-responses/coupon-code';
import { ProductTaxPercentType } from '@/types/api-responses/product';
import { User } from '@/types/api-responses/users';

export enum OrderStatusEnum {
  processing = 'processing',
  completed = 'completed',
  unpaid = 'unpaid',
}

export type OrderStatus = keyof typeof OrderStatusEnum;

export type OrderSummary = {
  id: string;
  orderId: string;
  amount: number;
  shippingAmount: number;
  couponId: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string;
  userId: string;
  status: string;
  user: {
    name: string;
    surname: string;
  };
};

export type Order = {
  coupon: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: CouponStatusEnum;
    name: string;
    code: string;
    type: CouponTypeEnum;
    value: number;
    policy: CouponPolicyEnum;
  } | null;
  user: User;
  shippingAddress: {
    nr: string;
    city: string;
    name: string;
    mobile: string;
    address: string;
    surname: string;
    zipCode: string;
    addition: string;
  };
  id: string;
  amount: string;
  shippingAmount: string;
  couponId: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date;
  userId: string;
  status: OrderStatus;
  orderItems: {
    id: string;
    orderId: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    taxPercent: ProductTaxPercentType;
    attributes: {
      productVariations?: {
        attribute: {
          id: string;
          name: string;
          slug: string;
          createdAt: string;
          productId: string;
          updatedAt: string;
        };
        attributeTerm: {
          id: string;
          name: string;
          slug: string;
          createdAt: string;
          sortOrder: number;
          updatedAt: string;
          productAttributeId: string;
          productVariationId: string | null;
        };
      }[];
    };
    image: string;
    variationId: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};
