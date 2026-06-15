import { create } from 'zustand'

export type Role = 'donor' | 'ngo' | 'admin' | null

interface AuthState {
  token: string | null
  role: Role
  isAuthenticated: boolean
  setAuth: (token: string, role: Role) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if available
  const storedToken = localStorage.getItem('token')
  const storedRole = localStorage.getItem('role') as Role

  return {
    token: storedToken,
    role: storedRole,
    isAuthenticated: !!storedToken,
    setAuth: (token, role) => {
      localStorage.setItem('token', token)
      if (role) localStorage.setItem('role', role)
      set({ token, role, isAuthenticated: true })
    },
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      set({ token: null, role: null, isAuthenticated: false })
    },
  }
})
