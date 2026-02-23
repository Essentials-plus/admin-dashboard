import { z } from 'zod';

export const createOrUpdateHomePageHeroSectionSchema = z.object({
  image: z.any(),
  title: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  buttonUrl: z.string().url(),
  buttonBackgroundColor: z.string().min(1),
  buttonTextColor: z.string().min(1),
});

export type CreateOrUpdateHomePageHeroSectionSchema = z.infer<
  typeof createOrUpdateHomePageHeroSectionSchema
>;

export type CreateOrUpdateHomePageHeroSectionFormProps = {};
