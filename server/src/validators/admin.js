import { z } from 'zod';

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1).max(10000),
  price: z.coerce.number().finite().min(0),
  compare_at_price: z.coerce.number().finite().min(0).nullable().optional(),
  stock_quantity: z.coerce.number().int().min(0),
  sku: z.string().trim().min(1).max(80),
  images: z.array(z.string().url()).default([]),
  category_id: z.coerce.number().int().positive(),
  is_active: z.boolean().default(true),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial().refine((data) => Object.keys(data).length > 0, 'Provide at least one product field to update.');

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  parent_id: z.coerce.number().int().positive().nullable().optional(),
});

export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema.partial().refine((data) => Object.keys(data).length > 0, 'Provide at least one category field to update.');

const discountSchema = z.object({
  code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().finite().positive(),
  min_order_amount: z.coerce.number().finite().min(0).nullable().optional(),
  max_uses: z.coerce.number().int().positive().nullable().optional(),
  is_active: z.boolean().default(true),
  expires_at: z.string().datetime().nullable().optional(),
});

const validateDiscountPercentage = (data, context) => {
  if (data.type === 'percentage' && data.value > 100) {
    context.addIssue({ code: 'custom', path: ['value'], message: 'Percentage discounts cannot exceed 100.' });
  }
};
export const createDiscountSchema = discountSchema.superRefine(validateDiscountPercentage);
export const updateDiscountSchema = discountSchema.partial()
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one discount field to update.')
  .superRefine(validateDiscountPercentage);

export const orderStatusSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled']),
});