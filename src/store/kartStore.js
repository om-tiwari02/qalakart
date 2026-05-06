import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useKartStore = create(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────────────────────────────────────
      cart: [],

      addToCart: (product) => {
        const existing = get().cart.find((i) => i.id === product.id);
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.id === product.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({ cart: [...get().cart, { ...product, qty: 1 }] });
        }
      },

      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((i) => i.id !== productId) }),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter((i) => i.id !== productId) });
        } else {
          set({
            cart: get().cart.map((i) =>
              i.id === productId ? { ...i, qty } : i
            ),
          });
        }
      },

      clearCart: () => set({ cart: [] }),

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
      orders: [
        // Mock upcoming orders
        {
          id: 'ORD-2041',
          items: [
            {
              name: 'Nebula Resin Clock',
              image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
              qty: 1,
              price: 1200,
            },
          ],
          total: 1200,
          status: 'upcoming',
          orderStep: 2, // 0=Placed, 1=Confirmed, 2=Shipped, 3=Out for delivery, 4=Delivered
          placedAt: '22 Apr 2026',
          expectedBy: '25 Apr 2026',
          creator: 'CraftyHands Bhopal',
        },
        {
          id: 'ORD-1987',
          items: [
            {
              name: 'Origami Flower Bouquet',
              image: 'https://images.unsplash.com/photo-1563241598-a262cb401b97',
              qty: 2,
              price: 1100,
            },
          ],
          total: 1100,
          status: 'upcoming',
          orderStep: 0,
          placedAt: '22 Apr 2026',
          expectedBy: '24 Apr 2026',
          creator: 'Paper Petals',
        },
        // Mock previous orders
        {
          id: 'ORD-1654',
          items: [
            {
              name: 'Personalized Wooden Keychain',
              image: 'https://images.unsplash.com/photo-1611077543886-31db6218177d',
              qty: 1,
              price: 250,
            },
          ],
          total: 250,
          status: 'previous',
          deliveredAt: '15 Apr 2026',
          creator: 'WoodWorks MP',
          rating: null,
          review: null,
        },
        {
          id: 'ORD-1432',
          items: [
            {
              name: 'Custom Portrait Sketch',
              image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
              qty: 1,
              price: 800,
            },
          ],
          total: 800,
          status: 'previous',
          deliveredAt: '10 Apr 2026',
          creator: 'Artistic Echoes',
          rating: 5,
          review: 'Absolutely stunning work, exceeded my expectations!',
        },
      ],

      placeOrder: (cartItems) => {
        const newOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          items: cartItems,
          total: cartItems.reduce((sum, i) => sum + i.price * i.qty, 0),
          status: 'upcoming',
          orderStep: 0,
          placedAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          expectedBy: new Date(Date.now() + 3 * 86400000).toLocaleDateString(
            'en-IN',
            { day: '2-digit', month: 'short', year: 'numeric' }
          ),
          creator: cartItems[0]?.creator || 'QalaKart Creator',
        };
        set({ orders: [newOrder, ...get().orders], cart: [] });
      },

      submitReview: (orderId, rating, review) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, rating, review } : o
          ),
        });
      },
    }),
    { name: 'qalakart-kart-storage' }
  )
);

export default useKartStore;
