import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native'
import { Colors, Radius, FontSize, FontWeight, Spacing } from '../../theme/colors'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  onPress: () => void
  title: string
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({
  onPress, title, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, fullWidth = false,
}: Props) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : Colors.brand} style={{ marginRight: 8 }} />}
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, borderWidth: 1.5,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  secondary: { backgroundColor: Colors.surfaceSecondary, borderColor: Colors.border },
  outline: { backgroundColor: 'transparent', borderColor: Colors.brand },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: Colors.error, borderColor: Colors.error },

  sm: { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2 },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },

  text: { fontWeight: FontWeight.semibold },
  primaryText: { color: '#fff', fontSize: FontSize.md },
  secondaryText: { color: Colors.text, fontSize: FontSize.md },
  outlineText: { color: Colors.brand, fontSize: FontSize.md },
  ghostText: { color: Colors.text, fontSize: FontSize.md },
  dangerText: { color: '#fff', fontSize: FontSize.md },

  smText: { fontSize: FontSize.sm },
  mdText: { fontSize: FontSize.md },
  lgText: { fontSize: FontSize.lg },
})
