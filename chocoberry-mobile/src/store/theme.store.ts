import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

interface ThemeStore {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'light',
  toggle: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
  setMode: (mode) => set({ mode }),
}))
