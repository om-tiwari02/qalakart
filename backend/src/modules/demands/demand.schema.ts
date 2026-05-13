import { z } from "zod";

export const createDemandSchema = z.object({
  body: z.object({
    productName: z.string({
      required_error: "Product name is required",
    }).min(3, "Product name must be at least 3 characters"),
    description: z.string({
      required_error: "Description is required",
    }).min(10, "Description must be at least 10 characters"),
    category: z.string().optional(),
    quantity: z.number().min(1).default(1),
  }),
});

export const getDemandSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Demand ID"),
  }),
});
