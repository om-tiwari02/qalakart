import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController
} from "./product.controller.js";
import { createProductSchema, queryProductSchema, updateProductSchema } from "./product.schema.js";

export const productRouter = Router();

// Public routes
productRouter.get("/", validate({ query: queryProductSchema }), listProductsController);
productRouter.get("/:id", getProductController);

// Protected routes
productRouter.use(requireAuth);
productRouter.post("/", validate({ body: createProductSchema }), createProductController);
productRouter.patch("/:id", validate({ body: updateProductSchema }), updateProductController);
productRouter.delete("/:id", deleteProductController);
