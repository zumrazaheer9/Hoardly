import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required. Please provide a valid email.' })
    .email('Invalid email address format. Please enter an email like user@example.com.'),
  password: z
    .string({ required_error: 'Password is required. Please provide a secure password.' })
    .min(8, 'Password must be at least 8 characters long. Please enter a longer password.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter. Please update your password.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter. Please update your password.')
    .regex(/[0-9]/, 'Password must contain at least one number. Please update your password.'),
  full_name: z
    .string({ required_error: 'Full name is required. Please enter your first and last name.' })
    .min(2, 'Name must be at least 2 characters long. Please enter your full name.')
    .max(100, 'Name cannot exceed 100 characters. Please shorten your entry.'),
  phone: z
    .string()
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email or username is required.' })
    .trim().toLowerCase()
    .refine((value) => value === 'admin' || z.string().email().safeParse(value).success, 'Enter a valid email address or username.'),
  password: z
    .string({ required_error: 'Password is required. Please enter your account password.' })
    .min(1, 'Password cannot be empty. Please enter your password.'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required. Please enter your account email.' })
    .email('Invalid email address format. Please enter a valid email address.'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'New password is required. Please provide a new password.' })
    .min(8, 'Password must be at least 8 characters long. Please enter a longer password.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter. Please update your password.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter. Please update your password.')
    .regex(/[0-9]/, 'Password must contain at least one number. Please update your password.'),
});
