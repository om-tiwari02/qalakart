import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: "Product ID is required",
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
    quantity: z.number({
      required_error: "Quantity is required",
    }).min(1, "Quantity must be at least 1"),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    productId: z.string({
      required_error: "Product ID is required",
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
  }),
});
