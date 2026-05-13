import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  getOrderController,
  getOrdersController,
  placeOrderController,
  updateOrderStatusController
} from "./order.controller.js";
import { placeOrderSchema, updateOrderStatusSchema } from "./order.schema.js";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", validate(placeOrderSchema), placeOrderController);
orderRouter.get("/", getOrdersController);
orderRouter.get("/:id", getOrderController);
orderRouter.patch("/:id/status", validate(updateOrderStatusSchema), updateOrderStatusController);
