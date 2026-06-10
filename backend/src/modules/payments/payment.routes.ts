import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  createRazorpayOrderController,
  getPaymentConfigController,
  verifyRazorpayPaymentController
} from "./payment.controller.js";
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from "./payment.schema.js";

export const paymentRouter = Router();

paymentRouter.use(requireAuth);

paymentRouter.get("/config", getPaymentConfigController);
paymentRouter.post("/razorpay/orders", validate(createRazorpayOrderSchema), createRazorpayOrderController);
paymentRouter.post("/razorpay/verify", validate(verifyRazorpayPaymentSchema), verifyRazorpayPaymentController);
