import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { useAuthStore } from '../../../src/store/auth.store'
import { useThemeStore } from '../../../src/store/theme.store'
import { useAuth } from '../../../src/hooks/useAuth'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { changeLanguage } from '../../../src/i18n'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import Toast from 'react-native-toast-message'

const MODULE_CARDS = [
  { icon: 'car', label: 'nav.suppliers', route: '/(app)/suppliers' },
  { icon: 'nutrition', label: 'nav.products', route: '/(app)/products' },
  { icon: 'wallet', label: 'nav.expenses', route: '/(app)/expenses' },
  { icon: 'people', label: 'nav.employees', route: '/(app)/employees' },
  { icon: 'bar-chart', label: 'nav.reports', route: '/(app)/reports' },
  { icon: 'storefront', label: 'nav.business', route: '/(app)/business/profile' },
  { icon: 'cube', label: 'nav.cashbox', route: '/(app)/cashbox' },
]

export default function MoreScreen() {
  const { colors } = useTheme()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const { mode, toggle } = useThemeStore()
  const { signOut } = useAuth()
  const [showLogout, setShowLogout] = React.useState(false)

  const handleLogout = async () => {
    await signOut()
    Toast.show({ type: 'success', text1: t('toast.loggedOut') })
    router.replace('/(auth)/login')
  }

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.avatarText, { color: colors.brand }]}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name}</Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>{user?.role}</Text>
          </View>
        </View>

        {/* Module Grid */}
        <View style={styles.grid}>
          {MODULE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.route}
              onPress={() => router.push(card.route as any)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name={card.icon as any} size={28} color={colors.brand} />
              <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>{t(card.label)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.settingsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Language */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('more.language')}</Text>
            <View style={styles.langBtns}>
              {(['tg', 'ru', 'en'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => changeLanguage(lang)}
                  style={[
                    styles.langBtn,
                    { backgroundColor: i18n.language === lang ? colors.brand : colors.surfaceAlt, borderRadius: radius.sm },
                  ]}
                >
                  <Text style={{ color: i18n.language === lang ? '#fff' : colors.textSecondary, fontWeight: fontWeight.medium }}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('more.theme')}</Text>
            <TouchableOpacity
              onPress={toggle}
              style={[styles.themeBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}
            >
              <Text style={{ color: colors.textPrimary }}>
                {mode === 'dark' ? `🌙 ${t('more.themeDark')}` : `☀️ ${t('more.themeLight')}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>
              {t('more.version')}: Choco Berry v1.0.0
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          style={[styles.logoutBtn, { backgroundColor: colors.redLight, borderRadius: radius.lg, marginHorizontal: spacing[4] }]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
          <Text style={[styles.logoutText, { color: colors.red }]}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing[8] }} />
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title={t('confirm.logout')}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
        danger
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], gap: spacing[4], borderBottomWidth: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  userName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  userRole: { fontSize: fontSize.sm, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing[4], gap: spacing[3] },
  card: { width: '47%', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[2], alignItems: 'center' },
  cardLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, textAlign: 'center' },
  settingsSection: { marginHorizontal: spacing[4], borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing[4] },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  settingLabel: { fontSize: fontSize.base },
  langBtns: { flexDirection: 'row', gap: spacing[2] },
  langBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  themeBtn: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], gap: spacing[2] },
  logoutText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
})
