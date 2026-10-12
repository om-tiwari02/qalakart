import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
  }),
});
