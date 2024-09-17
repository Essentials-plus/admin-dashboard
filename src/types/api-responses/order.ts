/* eslint-disable no-unused-vars */
import {
  CouponPolicyEnum,
  CouponStatusEnum,
  CouponTypeEnum,
} from '@/types/api-responses/coupon-code';
import { Product, ProductTypeEnum } from '@/types/api-responses/product';
import {
  ProductAttribute,
  ProductAttributeTerm,
  ProductVariation,
} from '@/types/api-responses/product-attribute';
import { User } from '@/types/api-responses/users';

export enum OrderStatusEnum {
  processing = 'processing',
  completed = 'completed',
  unpaid = 'unpaid',
}

export type OrderStatus = keyof typeof OrderStatusEnum;

export type OrderSummary = {
  id: string;
  amount: number;
  shippingAmount: number;
  couponId: string | null;
  createdAt: string;
  updatedAt: string;
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
  products: {
    count: number;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    productId: string;
    orderId: string | null;
    variationId: string | null;
    variation: ProductVariation | null;
    placed: boolean;
    product: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      type: ProductTypeEnum;
      slug: string;
      description: string | null;
      salePrice: number | null;
      regularPrice: number | null;
      images: string[];
      stock: number | null;
      categoryId: string | null;
      variationId: string | null;
      variations: ProductVariation[];
      attributeTerms: ProductAttributeTerm[];
      attributes: ProductAttribute[];
    } & Pick<Product, 'taxPercent'>;
  }[];
  id: string;
  amount: string;
  shippingAmount: string;
  couponId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  status: OrderStatus;
};
