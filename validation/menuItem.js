import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(1),
  isVeg: z.boolean().default(true),
  isRecommended: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNewItem: z.boolean().default(false),
  isTodaySpecial: z.boolean().default(false),
  spicyLevel: z.number().int().min(1).max(3).default(1),
  isAvailable: z.boolean().default(true),
  hasOffer: z.boolean().default(false),
  offerLabel: z.string().optional(),
  image: z.string().optional()
  // restaurant is added automatically from route param
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  isVeg: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isNewItem: z.boolean().optional(),
  isTodaySpecial: z.boolean().optional(),
  spicyLevel: z.number().int().min(1).max(3).optional(),
  isAvailable: z.boolean().optional(),
  hasOffer: z.boolean().optional(),
  offerLabel: z.string().optional(),
  image: z.string().optional()
});

export default {
  createMenuItemSchema,
  updateMenuItemSchema
};