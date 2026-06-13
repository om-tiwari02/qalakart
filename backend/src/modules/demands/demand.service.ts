import { Demand, IDemand } from "./demand.model.js";

export async function createDemand(userId: string, data: Partial<IDemand>) {
  return Demand.create({ ...data, userId });
}

export async function getDemands(filter: any = {}) {
  return Demand.find(filter).sort({ createdAt: -1 }).populate("userId", "firstName lastName").exec();
}

export async function getDemandById(id: string) {
  const demand = await Demand.findById(id).populate("userId", "firstName lastName").exec();
  if (!demand) {
    const err = new Error("Demand not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return demand;
}

export async function deleteDemand(id: string, userId: string) {
  const demand = await Demand.findOneAndDelete({ _id: id, userId }).exec();
  if (!demand) {
    const err = new Error("Demand not found or unauthorized") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return demand;
}

export async function acceptDemand(id: string, creatorId: string, price: number) {
  const demand = await Demand.findById(id).exec();
  if (!demand) {
    const err = new Error("Demand not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  if (demand.status !== "open") {
    const err = new Error("Demand is not open") as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }

  demand.status = "accepted";
  demand.creatorId = creatorId as any;
  demand.price = price;
  await demand.save();

  // Create a hidden custom product
  const { Product } = await import("../products/product.model.js");
  const customProduct = await Product.create({
    title: `Custom Order: ${demand.productName}`,
    description: `Custom order based on demand: ${demand.description}`,
    price: price,
    category: demand.category || "Custom",
    images: demand.images && demand.images.length > 0 ? demand.images : [],
    userId: creatorId,
    isDeleted: true // Hidden from regular listings
  });

  // Add to buyer's cart
  const { Cart } = await import("../cart/cart.model.js");
  let cart = await Cart.findOne({ userId: demand.userId }).exec();
  if (!cart) {
    cart = await Cart.create({ userId: demand.userId, items: [] });
  }

  cart.items.push({
    productId: customProduct._id as any,
    quantity: demand.quantity
  });
  await cart.save();

  return demand;
}
