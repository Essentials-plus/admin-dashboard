import { ProductAttribute } from '@/types/api-responses/product-attribute';
import { z } from 'zod';

export const createProductAttributeSchema = z.object({
  name: z.string().min(1),
});

export type CreateProductAttributeSchema = z.infer<
  typeof createProductAttributeSchema
>;

export type CreateOrUpdateProductAttributeFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (productAttribute?: ProductAttribute) => void;
  onApiError?: () => void;
  attributeId?: string;
};
