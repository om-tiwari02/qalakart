import { Types } from "mongoose";
import { Cart } from "./cart.model.js";

export async function getCart(userId: string) {
  let cart = await Cart.findOne({ userId }).populate("items.productId").exec();
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const cart = await getCart(userId);
  const itemIndex = cart.items.findIndex((item: any) => {
    const idStr = item.productId?._id ? item.productId._id.toString() : item.productId.toString();
    return idStr === productId;
  });

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId: new Types.ObjectId(productId), quantity });
  }

  return cart.save();
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getCart(userId);
  cart.items = cart.items.filter((item: any) => {
    const idStr = item.productId?._id ? item.productId._id.toString() : item.productId.toString();
    return idStr !== productId;
  });
  return cart.save();
}

export async function clearCart(userId: string) {
  return Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true }).exec();
}
