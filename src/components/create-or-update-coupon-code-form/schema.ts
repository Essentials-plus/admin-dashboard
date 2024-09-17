import {
  CouponCode,
  CouponPolicyEnum,
  CouponStatusEnum,
  CouponTypeEnum,
} from '@/types/api-responses/coupon-code';
import { z } from 'zod';

export const createCouponCodeSchema = z.object({
  name: z.string(),
  code: z.string(),
  type: z.nativeEnum(CouponTypeEnum),
  policy: z.nativeEnum(CouponPolicyEnum),
  status: z.nativeEnum(CouponStatusEnum),
  value: z.number().positive(),
});

export type CreateCouponCodeSchema = z.infer<typeof createCouponCodeSchema>;

export type CreateOrUpdateCouponCodeFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (couponCode?: CouponCode) => void;
  onApiError?: () => void;
  couponCodeId?: string;
};
