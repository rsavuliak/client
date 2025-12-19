import { create } from 'zustand'
import type { User } from '../types/User'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User) => void
  clearUser: () => void
  finishLoading: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false
    }),

  finishLoading: () =>
    set({ isLoading: false })
}))