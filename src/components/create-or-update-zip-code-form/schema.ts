import { ZipCode } from '@/types/api-responses/zip-code';
import { z } from 'zod';

export const createZipCodeSchema = z.object({
  lockdownDay: z.number().positive().min(1).max(7),
  zipCode: z.string().refine(
    (value) => {
      if (!/\d{4}(-\d{4})?/.test(value)) {
        return false; // Invalid format
      }

      // Split the value into parts
      const parts = value.split('-');

      // If it's a range
      if (parts.length === 2) {
        const [start, end] = parts.map(Number);
        return start < end; // Validate range
      }

      return true; // Single number
    },
    { message: 'Invalid zip code format or range.' }
  ),
});

export const updateZipCodeSchema = z.object({
  lockdownDay: z.number().positive().min(1).max(7),
  // zipCode: z.string().refine(
  //   (value) => {
  //     return /^\d+$/.test(value);
  //   },
  //   { message: 'Zip code must be a numeric string.' }
  // ),
  zipCode: z.string(),
});

export type CreateZipCodeSchema = z.infer<typeof createZipCodeSchema>;

export type CreateOrUpdateZipCodeFormProps = {
  // eslint-disable-next-line no-unused-vars
  onCreateOrUpdate?: (zipCode?: ZipCode) => void;
  onApiError?: () => void;
  zipCodeId?: string;
};
