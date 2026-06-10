import { z } from "zod";

export const createRazorpayOrderSchema = {
  body: z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    currency: z.string().length(3).default("INR"),
    receipt: z.string().max(40).optional(),
    notes: z.record(z.string(), z.string()).optional()
  })
};

export const verifyRazorpayPaymentSchema = {
  body: z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1)
  })
};
