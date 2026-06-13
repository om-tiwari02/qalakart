import { client } from "../lib/api/client";
import { mockProducts } from "../data/mockData";

const toApiProduct = (product) => ({
  ...product,
  _id: product._id || product.id,
  title: product.title || product.name,
  images: product.images?.length ? product.images : [product.image],
  creatorName: product.creatorName || product.creator
});

const mockApiProducts = () => mockProducts.map(toApiProduct);

export const productService = {
  async list(params = {}) {
    try {
      const { data } = await client.get("/products", { params });
      const products = Array.isArray(data.data) ? data.data : [];

      const apiProducts = products.map(toApiProduct);
      const mocks = mockApiProducts();

      return [...apiProducts, ...mocks];
    } catch (error) {
      return mockApiProducts();
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
