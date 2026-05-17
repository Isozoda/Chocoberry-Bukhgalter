import React from 'react'
import { Tabs } from 'expo-router'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { fontSize, fontWeight } from '../../../src/theme'

function TabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const tabs = [
    { name: 'dashboard', icon: 'home', label: t('nav.dashboard') },
    { name: 'sales', icon: 'cart', label: t('nav.sales') },
    { name: 'inventory', icon: 'layers', label: t('nav.inventory') },
    { name: 'daily-report', icon: 'clipboard', label: t('nav.dailyReport') },
    { name: 'more', icon: 'grid', label: t('nav.more') },
  ]

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isActive = state.index === index
        const tab = tabs[index] ?? { name: route.name, icon: 'ellipse', label: route.name }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.navigate(route.name)
            }}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
              size={24}
              color={isActive ? colors.brand : colors.textTertiary}
            />
            <Text style={[styles.label, { color: isActive ? colors.brand : colors.textTertiary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="sales" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="daily-report" />
      <Tabs.Screen name="more" />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    height: 65 + 0,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
})
