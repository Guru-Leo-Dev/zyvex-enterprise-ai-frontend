import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      role: 'user', // 'admin' | 'user' | 'viewer'

      setAuth: ({ user, token, refreshToken }) => {
        set({ user, token, refreshToken, isAuthenticated: true, role: user?.role || 'user' })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      setTokens: ({ token, refreshToken }) => {
        set({ token, refreshToken })
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, role: 'user' })
      },

      hasRole: (requiredRole) => {
        const roleHierarchy = { admin: 3, user: 2, viewer: 1 }
        const userLevel = roleHierarchy[get().role] || 0
        const requiredLevel = roleHierarchy[requiredRole] || 0
        return userLevel >= requiredLevel
      },
    }),
    {
      name: 'zyvex-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
)

export default useAuthStore
