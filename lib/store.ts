import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "./types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setUser: (user: User | null) => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, token) => {
        // Save token to cookie for middleware access
        if (typeof document !== "undefined") {
          document.cookie = `auth-token=${token}; path=/; max-age=86400`
          // Also explicitly save token to localStorage for API interceptor
          // (zustand persist handles this automatically, but this ensures immediate availability)
          localStorage.setItem("auth-token", token)
        }
        // Token is persisted to localStorage via zustand persist middleware
        // and used in Authorization header via api.ts interceptor
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        // Clear token from cookie and localStorage
        if (typeof document !== "undefined") {
          document.cookie = "auth-token=; path=/; max-age=0"
          localStorage.removeItem("auth-token")
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : (userData as User),
        })),
      setUser: (user) => set({ user }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (_persistedState) => {
        // After rehydration (whether there was persisted state or not),
        // mark the store as hydrated. Use a microtask to avoid updating
        // React state during render.
        if (typeof window !== "undefined") {
          queueMicrotask(() => {
            // useAuthStore may be referenced here safely after creation
            try {
              useAuthStore.getState().setHydrated()
            } catch (e) {
              // swallow errors during startup
            }
          })
        }
      },
    },
  ),
)

interface SidebarState {
  isCollapsed: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}))

interface SearchState {
  query: string
  setQuery: (query: string) => void
  clearQuery: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: "" }),
}))
