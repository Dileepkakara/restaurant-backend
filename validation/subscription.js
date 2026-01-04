import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  features: z.array(z.string()).optional(),
  maxRestaurants: z.number().nonnegative().optional()
});

export const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  maxRestaurants: z.number().nonnegative().optional()
});

export default { createSchema, updateSchema };
