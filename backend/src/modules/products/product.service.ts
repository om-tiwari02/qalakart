import { Product } from "./product.model.js";

export async function createProduct(userId: string, data: any) {
  const product = new Product({ ...data, userId });
  await product.save();
  return product;
}

export async function getProducts(query: any) {
  const { page, limit, search, category } = query;
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
