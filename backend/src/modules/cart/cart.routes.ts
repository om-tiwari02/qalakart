import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController
} from "./cart.controller.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.schema.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", getCartController);
cartRouter.post("/add", validate(addToCartSchema), addToCartController);
cartRouter.delete("/remove/:productId", validate(removeFromCartSchema), removeFromCartController);
cartRouter.delete("/clear", clearCartController);
