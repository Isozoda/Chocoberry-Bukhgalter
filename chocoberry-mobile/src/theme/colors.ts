const palette = {
  brand: '#E8593C',
  brandDark: '#C93F24',
  brandLight: '#FFEDE8',
  chocolate: '#4A2810',
  cream: '#FFF5E6',
  green: '#22C55E',
  greenLight: '#DCFCE7',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
}

export const lightColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  ...palette,
}

export const darkColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceAlt: '#242424',
  border: '#2D2D2D',
  borderLight: '#333333',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textInverse: '#111827',
  ...palette,
  brandLight: '#2D1A16',
  greenLight: '#0E2215',
  blueLight: '#111D2D',
  amberLight: '#2D1E0B',
  redLight: '#2D1111',
  purpleLight: '#1E112D',
}

export type AppColors = typeof lightColors
