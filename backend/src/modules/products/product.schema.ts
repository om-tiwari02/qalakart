import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  category: z.string().min(1),
  images: z.array(z.string()).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  userId: z.string().optional()
});

