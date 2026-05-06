import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { name, age, address, phone, email, qalaCoins }
      role: 'guest', // 'guest', 'buyer', 'creator'
      isAuthenticated: false,
      isSubscribed: false,
      hasUsedCoupon: false,
      login: (userData, role) => set({ 
        user: { 
          qalaCoins: 0, 
          age: '', 
          address: '', 
          phone: '', 
          email: '', 
          ...userData 
        }, 
        role: role === 'seller' ? 'creator' : role, 
        isAuthenticated: true,
        hasUsedCoupon: false
      }),
      logout: () => set({ user: null, role: 'guest', isAuthenticated: false, isSubscribed: false, hasUsedCoupon: false }),
      setSubscribed: () => set({ isSubscribed: true }),
      updateUser: (newData) => set((state) => ({
        user: { ...state.user, ...newData }
      })),
      addCoins: (amount) => set((state) => ({
        user: { ...state.user, qalaCoins: Math.round((state.user?.qalaCoins || 0) + amount) }
      })),
      deductCoins: (amount) => set((state) => ({
        user: { ...state.user, qalaCoins: Math.max(0, (state.user?.qalaCoins || 0) - amount) }
      })),
      useCoupon: () => set((state) => ({
        user: { ...state.user, qalaCoins: (state.user?.qalaCoins || 0) - 500 },
        hasUsedCoupon: true
      }))
    }),
    {
      name: 'qalakart-auth-storage',
    }
  )
);

export default useAuthStore;
