import React from 'react'
import { View, StyleSheet, Animated, useAnimatedValue } from 'react-native'
import { useEffect } from 'react'
import { useTheme } from '@theme/index'
import { spacing, radius } from '@theme/index'

function SkeletonBox({ height = 20, width = '100%' as number | `${number}%`, style }: { height?: number; width?: number | `${number}%`; style?: object }) {
  const { colors } = useTheme()
  const opacity = useAnimatedValue(0.3)

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  return (
    <Animated.View
      style={[
        { height, width, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, opacity },
        style,
      ]}
    />
  )
}

export function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.row}>
          <SkeletonBox height={60} width="100%" />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing[4], gap: spacing[3] },
  row: { marginBottom: spacing[2] },
})
