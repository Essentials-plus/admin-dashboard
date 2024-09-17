import { ProductAttributeTerm } from '@/types/api-responses/product-attribute';
import { z } from 'zod';

export const createProductAttributeTermSchema = z.object({
  name: z.string().min(1),
});

export type CreateProductAttributeTermSchema = z.infer<
  typeof createProductAttributeTermSchema
>;

export type CreateOrUpdateProductAttributeTermFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (productAttributeTerm?: ProductAttributeTerm) => void;
  onApiError?: () => void;
  attributeTermId?: string;
  attributeId: string;
};
