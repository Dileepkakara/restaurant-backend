import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  location: z.string().optional(),
  restaurantName: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default { registerSchema, loginSchema };
