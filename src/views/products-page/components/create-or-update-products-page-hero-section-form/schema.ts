import { z } from 'zod';

export const createOrUpdateProductsPageHeroSectionSchema = z.object({
  image: z.any(),
  title: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  buttonUrl: z.string().url(),
});

export type CreateOrUpdateProductsPageHeroSectionSchema = z.infer<
  typeof createOrUpdateProductsPageHeroSectionSchema
>;

export type CreateOrUpdateProductsPageHeroSectionFormProps = {};
