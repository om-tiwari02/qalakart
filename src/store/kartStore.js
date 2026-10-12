import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { client } from '../lib/api/client';
import { productService } from '../services/productService';

const useKartStore = create(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────────────────────────────────────
      cart: [],
      isCartLoading: false,

      fetchCart: async () => {
        set({ isCartLoading: true });
        try {
          const res = await client.get('/cart');
          // Backend returns cart.items: [{ productId: {...}, quantity: 1 }]
          // We map it to frontend expected structure
          const items = res.data.data?.items || [];
          const mappedCart = items.map(item => ({
            id: item.productId._id,
            name: item.productId.title,
            image: productService.getImageUrl(item.productId.images?.[0]),
            price: item.productId.price,
            qty: item.quantity,
            creator: item.productId.creatorName || 'QalaKart Creator'
          }));
          set({ cart: mappedCart });
        } catch (error) {
          console.error("Failed to fetch cart", error);
        } finally {
          set({ isCartLoading: false });
        }
      },

      addToCart: async (product) => {
        try {
          await client.post('/cart/add', { productId: product.id, quantity: 1 });
          get().fetchCart(); // Re-fetch from backend to stay in sync
        } catch (error) {
          console.error("Failed to add to cart", error);
        }
      },

      removeFromCart: async (productId) => {
        try {
          await client.delete(`/cart/remove/${productId}`);
          get().fetchCart();
        } catch (error) {
          console.error("Failed to remove from cart", error);
        }
      },

      updateQty: async (productId, qty) => {
        if (qty <= 0) {
          await get().removeFromCart(productId);
          return;
        }
        try {
          await client.delete(`/cart/remove/${productId}`);
          await client.post('/cart/add', { productId, quantity: qty });
          get().fetchCart();
        } catch (error) {
          console.error("Failed to update qty", error);
        }
      },

      clearCart: async () => {
        try {
          await client.delete('/cart/clear');
          get().fetchCart();
        } catch (error) {
          console.error("Failed to clear cart", error);
        }
      },

      // ── Wishlist ──────────────────────────────────────────────────────────
      wishlist: [],

      toggleWishlist: (product) => {
        const exists = get().wishlist.find((i) => i.id === product.id);
        if (exists) {
          set({ wishlist: get().wishlist.filter((i) => i.id !== product.id) });
        } else {
          set({ wishlist: [...get().wishlist, product] });
        }
      },

      isWishlisted: (productId) =>
        get().wishlist.some((i) => i.id === productId),

      // ── Orders ────────────────────────────────────────────────────────────
      orders: [],
      isOrdersLoading: false,

      fetchOrders: async () => {
        set({ isOrdersLoading: true });
        try {
          const res = await client.get('/orders');
          const mappedOrders = res.data.data.map(o => ({
            id: o._id,
            items: o.items.map(item => ({
              id: item.productId._id,
              name: item.productId.title,
              image: productService.getImageUrl(item.productId.images?.[0]),
              qty: item.quantity,
              price: item.price
            })),
            total: o.totalAmount,
            status: ['pending', 'processing', 'shipped'].includes(o.status) ? 'upcoming' : 'previous',
            orderStep: o.status === 'pending' ? 0 : o.status === 'processing' ? 1 : o.status === 'shipped' ? 2 : o.status === 'delivered' ? 4 : 0,
            placedAt: new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            expectedBy: new Date(new Date(o.createdAt).getTime() + 3 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            deliveredAt: o.status === 'delivered' ? new Date(o.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
            seller: o.items[0]?.productId?.creatorName || 'QalaKart Creator'
          }));
          set({ orders: mappedOrders });
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          set({ isOrdersLoading: false });
        }
      },

      placeOrder: async (shippingAddress, paymentMethod = 'cod', paymentStatus = 'pending') => {
        try {
          await client.post('/orders', { shippingAddress, paymentMethod, paymentStatus });
          get().fetchCart();
          get().fetchOrders();
        } catch (error) {
          console.error("Failed to place order", error);
          throw error;
        }
      },

      submitReview: (orderId, rating, review) => {
        // Mock review for now since there's no backend endpoint yet
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, rating, review } : o
          ),
        });
      },
    }),
    { 
      name: 'qalakart-kart-storage',
      partialize: (state) => ({ wishlist: state.wishlist }), // Only persist wishlist
    }
  )
);

export default useKartStore;
