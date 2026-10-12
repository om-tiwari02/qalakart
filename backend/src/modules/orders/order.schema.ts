import { z } from "zod";
import { OrderStatus } from "./order.model.js";

export const placeOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.string().min(10, "Shipping address is required and must be at least 10 characters"),
    paymentMethod: z.enum(['online', 'cod']).optional(),
    paymentStatus: z.enum(['pending', 'completed']).optional()
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});
