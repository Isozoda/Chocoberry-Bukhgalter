import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

interface MenuSection {
  title: string
  items: Array<{ icon: string; label: string; route: keyof MoreStackParamList; color: string }>
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '🛒 Таъминот ва маҳсулот',
    items: [
      { icon: 'people-circle-outline', label: 'Таъминкунандагон', route: 'Suppliers', color: Colors.info },
      { icon: 'cafe-outline', label: 'Маҳсулот', route: 'Products', color: Colors.brand },
    ],
  },
  {
    title: '💰 Молия',
    items: [
      { icon: 'receipt-outline', label: 'Хароҷот', route: 'Expenses', color: Colors.error },
      { icon: 'list-outline', label: 'Хароҷоти доимӣ', route: 'FixedExpenses', color: Colors.warning },
      { icon: 'wallet-outline', label: 'Касса', route: 'Cashbox', color: Colors.success },
      { icon: 'shield-checkmark-outline', label: 'Фондҳо', route: 'Funds', color: Colors.violet },
    ],
  },
  {
    title: '📋 Ҳисоботҳо',
    items: [
      { icon: 'document-text-outline', label: 'Ҳисоботи рӯзона', route: 'DailyReport', color: Colors.info },
      { icon: 'bar-chart-outline', label: 'Ҳисоботҳо', route: 'Reports', color: Colors.brand },
      { icon: 'flash-outline', label: 'Маслиҳатчии AI', route: 'AIAdvisor', color: Colors.violet },
    ],
  },
  {
    title: '⚙️ Танзимот',
    items: [
      { icon: 'settings-outline', label: 'Танзимот', route: 'Settings', color: Colors.textSecondary },
      { icon: 'business-outline', label: 'Профили тиҷорат', route: 'BusinessProfile', color: Colors.info },
    ],
  },
]

export function MoreScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const { user } = useAuth()

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Бештар" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user?.name?.[0] ?? 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>{user?.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </View>
        </Card>

        {MENU_SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => navigation.navigate(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  userCard: {},
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.brand },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  userEmail: { fontSize: FontSize.xs, color: Colors.textSecondary },
  userRole: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: FontWeight.medium, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
})
