import { z } from 'zod';

export const approveSchema = z.object({
  // No body needed currently, placeholder
});

export const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  image: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  phone: z.string().optional(),
  plan: z.string().optional()
});

export const updateSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  phone: z.string().optional(),
  plan: z.string().optional(),
  status: z.enum(['pending','approved','rejected']).optional()
});

export default { approveSchema, createSchema, updateSchema };
