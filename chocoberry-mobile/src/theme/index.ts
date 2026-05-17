import { useThemeStore } from '@store/theme.store'
import { darkColors, lightColors } from './colors'

export { fontSize, fontWeight, lineHeight } from './typography'
export { spacing } from './spacing'
export { radius } from './radius'
export { lightColors, darkColors } from './colors'
export type { AppColors } from './colors'

export function useTheme() {
  const { mode } = useThemeStore()
  const colors = mode === 'dark' ? darkColors : lightColors
  return { colors, mode, isDark: mode === 'dark' }
}
