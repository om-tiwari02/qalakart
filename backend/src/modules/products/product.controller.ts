import type { Request, Response } from "express";
import { assertOwnership } from "../../utils/ownershipCheck.js";
import { Product } from "./product.model.js";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "./product.service.js";

export async function listProductsController(req: Request, res: Response) {
  const result = await getProducts(req.query);
  return res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

export async function getProductController(req: Request, res: Response) {
  const product = await getProductById(req.params["id"] as string);
  return res.status(200).json({ success: true, data: product });
}

export async function createProductController(req: Request, res: Response) {
  const product = await createProduct(req.user!.sub, req.body);
  return res.status(201).json({ success: true, data: product });
}

export async function updateProductController(req: Request, res: Response) {
  const product = await assertOwnership(Product, req.params["id"] as string, req.user!.sub);
  const updated = await updateProduct(product, req.body);
  return res.status(200).json({ success: true, data: updated });
}

export async function deleteProductController(req: Request, res: Response) {
  const product = await assertOwnership(Product, req.params["id"] as string, req.user!.sub);
  await deleteProduct(product);
  return res.status(200).json({ success: true, data: { ok: true } });
}
