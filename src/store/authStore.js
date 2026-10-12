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
      set({
        user: refresh.data.user,
        role: refresh.data.user.role,
        isSubscribed: refresh.data.user.role === 'creator',
        isAuthenticated: true,
        isBootstrapping: false
      });
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 401) {
        console.error('Bootstrap failed:', status === 503 ? 'DB not connected' : err.message);
      }
      tokenStore.clear();
      set({ user: null, role: 'guest', isAuthenticated: false, isSubscribed: false, isBootstrapping: false });
    }
  },

  login: async (credentials) => {
    const { data } = await client.post('/auth/login', credentials);
    return data.data;
  },

  verifyLoginOtp: async ({ email, otp }) => {
    const { data } = await client.post('/auth/login/verify-otp', { email, otp });
    tokenStore.set(data.data.accessToken);
    set({
      user: data.data.user,
      role: data.data.user.role,
      isSubscribed: data.data.user.role === 'creator',
      isAuthenticated: true
    });
  },

  register: async (credentials) => {
    const { data } = await client.post('/auth/register', credentials);
    if (data.data?.accessToken) {
      tokenStore.set(data.data.accessToken);
      set({
        user: data.data.user,
        role: data.data.user.role,
        isSubscribed: data.data.user.role === 'creator',
        isAuthenticated: true
      });
    }
    return data.data;
  },

  googleLogin: async (credential) => {
    const { data } = await client.post('/auth/google', { credential });
    if (data.data?.accessToken) {
      tokenStore.set(data.data.accessToken);
      set({
        user: data.data.user,
        role: data.data.user.role,
        isSubscribed: data.data.user.role === 'creator',
        isAuthenticated: true
      });
    }
    return data.data;
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

  setSubscribed: () => set((state) => ({
    isSubscribed: true,
    role: 'creator',
    user: state.user ? { ...state.user, role: 'creator' } : null
  })),
  updateUser: (newData) => set((state) => ({ user: { ...state.user, ...newData } })),
  uploadProfileImage: async (imageBase64) => {
    const { data } = await client.patch('/users/me/profile-image', { imageBase64 });
    set((state) => ({ user: { ...state.user, profileImage: data.data.profileImage } }));
    return data.data.profileImage;
  },
  addCoins: (amount) => set((state) => ({ user: { ...state.user, qalaCoins: Math.round((state.user?.qalaCoins || 0) + amount) } })),
  deductCoins: (amount) => set((state) => ({ user: { ...state.user, qalaCoins: Math.max(0, (state.user?.qalaCoins || 0) - amount) } })),
  useCoupon: () => set((state) => ({ user: { ...state.user, qalaCoins: (state.user?.qalaCoins || 0) - 500 }, hasUsedCoupon: true }))
}));

export default useAuthStore;
