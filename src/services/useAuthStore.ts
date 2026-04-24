import { create } from 'zustand'
import type { User, UserProfile } from '../types/User'

type AuthState = {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User) => void
  clearUser: () => void
  finishLoading: () => void
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
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
      profile: null,
      isAuthenticated: false
    }),

  finishLoading: () =>
    set({ isLoading: false }),

  setProfile: (profile) =>
    set({ profile }),

  clearProfile: () =>
    set({ profile: null }),
}))