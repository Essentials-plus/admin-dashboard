import { Product } from '@/types/api-responses/product';
import { SpotlightsProductBanner } from '@/types/api-responses/spotlights-product-banner';
import { z } from 'zod';

export const createSpotlightsProductBannerSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(1),
  image: z.any(),
});

export const updateSpotlightsProductBannerSchema =
  createSpotlightsProductBannerSchema;

export type CreateSpotlightsProductBannerSchema = z.infer<
  typeof createSpotlightsProductBannerSchema
>;
export type UpdateSpotlightsProductBannerSchema = z.infer<
  typeof updateSpotlightsProductBannerSchema
>;

export type CreateOrUpdateSpotlightsProductBannerFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (spotlightsProductBanner: SpotlightsProductBanner) => void;
  onApiError?: () => void;
  spotlightsProductBannerId?: string;
  product?: Product;
};
