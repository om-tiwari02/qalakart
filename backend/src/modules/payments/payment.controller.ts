import type { Request, Response } from "express";
import { createRazorpayOrder, getRazorpayConfig, verifyRazorpayPayment } from "./payment.service.js";

export async function getPaymentConfigController(_req: Request, res: Response) {
  return res.status(200).json({ success: true, data: getRazorpayConfig() });
}

export async function createRazorpayOrderController(req: Request, res: Response) {
  const order = await createRazorpayOrder(req.body);
  return res.status(201).json({ success: true, data: order });
}

export async function verifyRazorpayPaymentController(req: Request, res: Response) {
  const verified = verifyRazorpayPayment(req.body);
  if (!verified) {
    return res.status(400).json({
      success: false,
      error: { code: "PAYMENT_VERIFICATION_FAILED", message: "Invalid Razorpay payment signature" }
    });
  }

  return res.status(200).json({ success: true, data: { verified: true } });
}
