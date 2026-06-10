import { client } from "../lib/api/client";
import { mockProducts } from "../data/mockData";

export const productService = {
  async list(params = {}) {
    try {
      const { data } = await client.get("/products", { params });
      return data.data; // Backend returns { status: "success", data: [...] }
    } catch (error) {
      if (error.response?.status !== 503) {
        throw error;
      }

      return mockProducts.map((product) => ({
        ...product,
        _id: product.id,
        title: product.name,
        images: [product.image],
        creatorName: product.creator
      }));
    }
  },

  async get(id) {
    const { data } = await client.get(`/products/${id}`);
    return data.data;
  },

  getImageUrl(path) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/products/")) return path;
    // Backend serves static files from /uploads
    // path is usually something like "/uploads/12345-image.jpg"
    // So we need to prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    return `${baseUrl}${path}`;
  }
};
