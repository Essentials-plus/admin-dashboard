import { UserStatusEnum } from '@/types/api-responses/users';
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().optional(),
  // profile: z.string().optional(),
  surname: z.string().optional(),
  // gender: z.nativeEnum(Gender).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email(),
  nr: z.string().optional(),
  addition: z.string().optional(),

  status: z.nativeEnum(UserStatusEnum),
  password: z.string().min(8).optional().or(z.literal('')),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
