export const Colors = {
  // Brand
  brand: '#E8593C',
  brandDark: '#D43E1F',
  brandLight: '#FAE0D8',
  brandFaded: 'rgba(232,89,60,0.12)',

  // Neutral
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: 'rgba(16,185,129,0.12)',
  warning: '#F59E0B',
  warningLight: 'rgba(245,158,11,0.12)',
  error: '#EF4444',
  errorLight: 'rgba(239,68,68,0.12)',
  info: '#3B82F6',
  infoLight: 'rgba(59,130,246,0.12)',

  // Special
  violet: '#8B5CF6',
  violetLight: 'rgba(139,92,246,0.12)',
  chocolate: '#4A2810',
  cream: '#FFF5E6',

  // Dark mode overrides (if needed)
  dark: {
    background: '#0F0F0F',
    backgroundSecondary: '#1A1A1A',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#3A3A3C',
    text: '#F2F2F7',
    textSecondary: '#AEAEB2',
  },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}
