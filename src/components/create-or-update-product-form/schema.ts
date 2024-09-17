import {
  ProductTaxPercentEnum,
  ProductTypeEnum,
} from '@/types/api-responses/product';
import { z } from 'zod';

export const createProductBaseSchema = z.object({
  name: z
    .string({ required_error: 'Required' })
    .min(1, { message: 'Required' }),
  slug: z
    .string({ required_error: 'Required' })
    .min(1, { message: 'Required' }),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  faqs: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
  specs: z
    .array(
      z.object({
        id: z.string().uuid(),
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  taxPercent: z.nativeEnum(ProductTaxPercentEnum),
  images: z.array(z.string().min(1)),
  type: z.nativeEnum(ProductTypeEnum, {
    required_error: 'Required',
    invalid_type_error: 'Required',
  }),
  categoryId: z.string().optional().nullable(),
});

export const createSimpleProductSchema = z
  .object({
    regularPrice: z
      .number({ invalid_type_error: 'Required', required_error: 'Required' })
      .positive(),
    salePrice: z
      .number({ invalid_type_error: 'Required', required_error: 'Required' })
      .positive()
      .or(z.literal('')),
    stock: z
      .number({
        required_error: 'Required',
      })
      .positive()
      .or(z.literal('')),
    lowStockThreshold: z
      .number({
        required_error: 'Required',
      })
      .positive()
      .or(z.literal('')),
  })
  .merge(createProductBaseSchema)
  .refine(
    (data) => {
      if (
        typeof data.salePrice === 'undefined' ||
        typeof data.salePrice === 'string'
      )
        return true;

      return data.regularPrice > data.salePrice;
    },
    {
      message: 'Sale price must be smaller than regular price',
      path: ['salePrice'],
    }
  );

export const createVariableProductSchema = createProductBaseSchema
  .merge(
    z.object({
      attributes: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
        })
      ),
      attributeTermIds: z.array(z.string().uuid()),
    })
  )
  .strip();

export const updateProductVariationSchema = z
  .object({
    regularPrice: z
      .number({ invalid_type_error: 'Required', required_error: 'Required' })
      .positive(),
    salePrice: z
      .number({ invalid_type_error: 'Required', required_error: 'Required' })
      .positive()
      .or(z.literal('')),
    stock: z
      .number({
        required_error: 'Required',
      })
      .positive()
      .or(z.literal('')),
    lowStockThreshold: z
      .number({
        required_error: 'Required',
      })
      .positive()
      .or(z.literal('')),
    image: z.string().url().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (
        typeof data.salePrice === 'undefined' ||
        typeof data.salePrice === 'string'
      )
        return true;

      return data.regularPrice > data.salePrice;
    },
    {
      message: 'Sale price must be smaller than regular price',
      path: ['salePrice'],
    }
  );

export type SimpleProductSchema = z.infer<typeof createSimpleProductSchema>;
export type VariableProductSchema = z.infer<typeof createVariableProductSchema>;
export type UpdateProductVariationSchema = z.infer<
  typeof updateProductVariationSchema
>;

export type CreateOrUpdateProductFormProps = {
  productId?: string;
};
