import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

const LANGUAGES = [
  { code: 'tj', label: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const { t, i18n } = useTranslation('settings')

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Шумо мутмаин ҳастед?',
      [
        { text: 'Бекор кун', style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logout()
            Toast.show({ type: 'success', text1: 'Шумо баромадед' })
          },
        },
      ]
    )
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('title')} showBack />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Account Card */}
        <Card style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{user?.name ?? '—'}</Text>
            <Text style={styles.accountEmail}>{user?.email ?? '—'}</Text>
            <Text style={styles.accountRole}>{user?.role === 'OWNER' ? 'Соҳиб' : user?.role === 'ADMIN' ? 'Менеҷер' : 'Кормандони'}</Text>
          </View>
        </Card>

        {/* Business Profile */}
        <Card>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('BusinessProfile', {})}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.brandFaded }]}>
              <Ionicons name="business-outline" size={20} color={Colors.brand} />
            </View>
            <Text style={styles.menuLabel}>{t('businessProfile')}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Language Selection */}
        <Card>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map(({ code, label, flag }) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.langBtn,
                  i18n.language === code && styles.langBtnActive,
                ]}
                onPress={() => i18n.changeLanguage(code)}
              >
                <Text style={styles.langFlag}>{flag}</Text>
                <Text style={[styles.langLabel, i18n.language === code && styles.langLabelActive]}>
                  {label}
                </Text>
                {i18n.language === code && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.brand} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Theme Toggle */}
        <Card>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? 'rgba(139,92,246,0.12)' : Colors.warningLight }]}>
              <Ionicons
                name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={theme === 'dark' ? Colors.violet : Colors.warning}
              />
            </View>
            <Text style={styles.menuLabel}>{theme === 'dark' ? t('darkMode') : t('lightMode')}</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.border, true: Colors.brand }}
              thumbColor={Colors.background}
            />
          </View>
        </Card>

        {/* Logout */}
        <Card>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.errorLight }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.error }]}>{t('logout')}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.error} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.version}>Choco Berry v1.0.0</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  accountCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textInverse },
  accountInfo: { flex: 1 },
  accountName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  accountEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  accountRole: { fontSize: FontSize.xs, color: Colors.brand, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  langGrid: { gap: Spacing.sm },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  langBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  langFlag: { fontSize: 20 },
  langLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  langLabelActive: { color: Colors.brand, fontWeight: FontWeight.semibold },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm },
})
