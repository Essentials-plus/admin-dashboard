import { z } from 'zod';

export const createOrUpdateLoginPageHeroSectionSchema = z.object({
  image: z.any(),
});

export type CreateOrUpdateLoginPageHeroSectionSchema = z.infer<
  typeof createOrUpdateLoginPageHeroSectionSchema
>;

export type CreateOrUpdateLoginPageHeroSectionFormProps = {};
