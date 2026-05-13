import type { Request, Response } from "express";
import { addToCart, clearCart, getCart, removeFromCart } from "./cart.service.js";

export async function getCartController(req: Request, res: Response) {
  const userId = req.user!._id;
  const cart = await getCart(userId);
  return res.status(200).json({ success: true, data: cart });
}

export async function addToCartController(req: Request, res: Response) {
  const userId = req.user!._id;
  const { productId, quantity } = req.body;
  const cart = await addToCart(userId, productId, quantity);
  return res.status(200).json({ success: true, data: cart });
}

export async function removeFromCartController(req: Request, res: Response) {
  const userId = req.user!._id;
  const { productId } = req.params;
  const cart = await removeFromCart(userId, productId);
  return res.status(200).json({ success: true, data: cart });
}

export async function clearCartController(req: Request, res: Response) {
  const userId = req.user!._id;
  const cart = await clearCart(userId);
  return res.status(200).json({ success: true, data: cart });
}
