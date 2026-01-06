import { z } from 'zod';

export const createOrderSchema = z.object({
    table: z.string().min(1),
    items: z.array(z.object({
        menuItem: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive()
    })).min(1),
    totalAmount: z.number().positive()
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'])
});

export default {
    createOrderSchema,
    updateOrderStatusSchema
};