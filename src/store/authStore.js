import { create } from 'zustand';
import { client } from '../lib/api/client';
import { refreshClient } from '../lib/api/refreshClient';
import { tokenStore } from '../auth/tokenStore';

const useAuthStore = create((set) => ({
  user: null,
  role: 'guest',
  isAuthenticated: false,
  isSubscribed: false,
  hasUsedCoupon: false,
  isBootstrapping: true,
  
  bootstrap: async () => {
    try {
      const { data: refresh } = await refreshClient.post('/auth/refresh');
      tokenStore.set(refresh.data.accessToken);
      set({ user: refresh.data.user, role: refresh.data.user.role, isAuthenticated: true, isBootstrapping: false });
    } catch (err) {
      console.error('Bootstrap failed:', err.response?.status === 503 ? 'DB not connected' : err.message);
      set({ isBootstrapping: false });
    }
  },

  login: async (credentials) => {
    const { data } = await client.post('/auth/login', credentials);
    tokenStore.set(data.data.accessToken);
    set({ user: data.data.user, role: data.data.user.role, isAuthenticated: true });
  },

  register: async (credentials) => {
    const { data } = await client.post('/auth/register', credentials);
    tokenStore.set(data.data.accessToken);
    set({ user: data.data.user, role: data.data.user.role, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // ignore
    }
    tokenStore.clear();
    set({ user: null, role: 'guest', isAuthenticated: false, isSubscribed: false, hasUsedCoupon: false });
  },

  setSubscribed: () => set({ isSubscribed: true }),
  updateUser: (newData) => set((state) => ({ user: { ...state.user, ...newData } })),
  addCoins: (amount) => set((state) => ({ user: { ...state.user, qalaCoins: Math.round((state.user?.qalaCoins || 0) + amount) } })),
  deductCoins: (amount) => set((state) => ({ user: { ...state.user, qalaCoins: Math.max(0, (state.user?.qalaCoins || 0) - amount) } })),
  useCoupon: () => set((state) => ({ user: { ...state.user, qalaCoins: (state.user?.qalaCoins || 0) - 500 }, hasUsedCoupon: true }))
}));

export default useAuthStore;
