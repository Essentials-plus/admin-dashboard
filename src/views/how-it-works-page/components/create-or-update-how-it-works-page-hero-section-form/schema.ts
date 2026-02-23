import { z } from 'zod';

export const createOrUpdateHowItWorksPageHeroSectionSchema = z.object({
  image: z.any(),
  title: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  buttonUrl: z.string().url(),
  buttonBackgroundColor: z.string().min(1),
  buttonTextColor: z.string().min(1),
});

export type CreateOrUpdateHowItWorksPageHeroSectionSchema = z.infer<
  typeof createOrUpdateHowItWorksPageHeroSectionSchema
>;

export type CreateOrUpdateHowItWorksPageHeroSectionFormProps = {};
