import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (t: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
  setTheme: (t) => set({ theme: t }),
}))
