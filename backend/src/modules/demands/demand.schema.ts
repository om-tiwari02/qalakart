import { z } from "zod";

export const createDemandSchema = z.object({
  body: z.object({
    productName: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().optional(),
    quantity: z.number().min(1).default(1),
    images: z.array(z.string()).optional(),
    creatorId: z.string().optional(),
  }),
});

export const acceptDemandSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Demand ID"),
  }),
  body: z.object({
    price: z.number().min(0, "Price must be at least 0"),
  }),
});

export const getDemandSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Demand ID"),
  }),
});
