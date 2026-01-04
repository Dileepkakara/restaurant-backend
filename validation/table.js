import { z } from 'zod';

export const createTableSchema = z.object({
  number: z.number().int().positive(),
  capacity: z.number().int().min(1).max(50),
  estimatedTime: z.number().int().min(1).max(480), // max 8 hours
  status: z.enum(['available', 'occupied', 'reserved']).default('available')
  // restaurant and qrCode are added automatically
});

export const updateTableSchema = z.object({
  number: z.number().int().positive().optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  estimatedTime: z.number().int().min(1).max(480).optional(),
  status: z.enum(['available', 'occupied', 'reserved']).optional()
});

export default {
  createTableSchema,
  updateTableSchema
};