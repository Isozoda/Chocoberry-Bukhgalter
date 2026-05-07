import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  mode: 'light' | 'dark'
  toggle: () => void
  setMode: (mode: 'light' | 'dark') => void
}

const applyTheme = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      toggle: () => {
        const next = get().mode === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ mode: next })
      },
      setMode: (mode) => {
        applyTheme(mode)
        set({ mode })
      },
    }),
    {
      name: 'chocoberry_theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode)
      },
    }
  )
)
