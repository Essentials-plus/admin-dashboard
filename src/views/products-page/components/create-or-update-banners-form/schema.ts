import { z } from 'zod';

export const createOrUpdateBannersSchema = z.object({
  banners: z
    .array(
      z.object({
        id: z.string().uuid(),
        image: z.any(),
        title: z.string().min(1),
        buttonText: z.string().min(1),
        buttonUrl: z.string().url(),
      })
    )
    .min(0),
  // {
  //   message: 'Please add atleast one banner',
  // }
});

export type CreateOrUpdateBannersSchema = z.infer<
  typeof createOrUpdateBannersSchema
>;

export type CreateOrUpdateBannersFormProps = {};
