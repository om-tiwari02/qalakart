import type { Request, Response } from "express";
import { getOrderById, getOrders, placeOrder, updateOrderStatus } from "./order.service.js";

export async function placeOrderController(req: Request, res: Response) {
  const userId = req.user!.sub as string;
  const { shippingAddress, paymentMethod, paymentStatus } = req.body;
  const order = await placeOrder(userId, shippingAddress, paymentMethod, paymentStatus);
  return res.status(201).json({ success: true, data: order });
}

export async function getOrdersController(req: Request, res: Response) {
  const userId = req.user!.sub as string;
  const orders = await getOrders(userId);
  return res.status(200).json({ success: true, data: orders });
}

export async function getCreatorOrdersController(req: Request, res: Response) {
  const creatorId = req.user!.sub as string;
  const { getCreatorOrders } = await import("./order.service.js");
  const orders = await getCreatorOrders(creatorId);
  return res.status(200).json({ success: true, data: orders });
}

export async function getOrderController(req: Request, res: Response) {
  const userId = req.user!.sub as string;
  const { id } = req.params;
  const order = await getOrderById(userId, id);
  return res.status(200).json({ success: true, data: order });
}

export async function updateOrderStatusController(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  const order = await updateOrderStatus(id, status);
  return res.status(200).json({ success: true, data: order });
}
