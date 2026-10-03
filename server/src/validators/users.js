import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).nullable().optional(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});