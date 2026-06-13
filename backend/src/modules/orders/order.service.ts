import { clearCart, getCart } from "../cart/cart.service.js";
import { Order, OrderStatus } from "./order.model.js";

export async function placeOrder(userId: string, shippingAddress: string, paymentMethod: 'online' | 'cod' = 'cod', paymentStatus: 'pending' | 'completed' = 'pending') {
  const cart = await getCart(userId);
  if (!cart.items || cart.items.length === 0) {
    const err = new Error("Cart is empty") as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }

  // Calculate total amount (assuming populate already gives productId as an object with price)
  let totalAmount = 0;
  const orderItems = cart.items.map((item: any) => {
    const price = item.productId.price;
    totalAmount += price * item.quantity;
    return {
      productId: item.productId._id,
      quantity: item.quantity,
      price: price
    };
  });

  const order = await Order.create({
    userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    status: OrderStatus.PENDING
  });

  await clearCart(userId);
  return order;
}

export async function getOrders(userId: string) {
  return Order.find({ userId }).sort({ createdAt: -1 }).populate("items.productId").exec();
}

export async function getCreatorOrders(creatorId: string) {
  const { Product } = await import("../products/product.model.js");
  const creatorProducts = await Product.find({ userId: creatorId }).select("_id").exec();
  const productIds = creatorProducts.map(p => p._id);

  return Order.find({ "items.productId": { $in: productIds } })
    .sort({ createdAt: -1 })
    .populate("items.productId")
    .populate("userId", "firstName lastName")
    .exec();
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, userId }).populate("items.productId").exec();
  if (!order) {
    const err = new Error("Order not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).exec();
  if (!order) {
    const err = new Error("Order not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return order;
}
