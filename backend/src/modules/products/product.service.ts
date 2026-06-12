import mongoose from "mongoose";
import { Product } from "./product.model.js";

const memoryProducts: any[] = [];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function createProduct(userId: string, data: any) {
  if (!isDbConnected()) {
    const product = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      userId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryProducts.push(product);
    return product;
  }

  const product = new Product({ ...data, userId });
  await product.save();
  return product;
}

export async function getProducts(query: any) {
  const { page, limit, search, category } = query;

  if (!isDbConnected()) {
    const normalizedSearch = search?.toLowerCase();
    const filtered = memoryProducts.filter((product) => {
      if (product.isDeleted) return false;
      if (category && product.category !== category) return false;
      if (!normalizedSearch) return true;

      return `${product.title} ${product.description}`.toLowerCase().includes(normalizedSearch);
    });

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      items,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit)
      }
    };
  }

  const skip = (page - 1) * limit;

  const filter: any = { isDeleted: false };
  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }

  const [items, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getProductById(id: string) {
  if (!isDbConnected()) {
    const product = memoryProducts.find((item) => item._id === id && !item.isDeleted);
    if (!product) {
      const err = new Error("Resource not found") as any;
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }
    return product;
  }

  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    const err = new Error("Resource not found") as any;
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return product;
}

export async function updateProduct(product: any, data: any) {
  Object.assign(product, data);
  await product.save();
  return product;
}

export async function deleteProduct(product: any) {
  product.isDeleted = true;
  await product.save();
  return product;
}
