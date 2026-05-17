import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../src/theme'
import { useAuth } from '../../src/hooks/useAuth'
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper'
import { FormInput } from '../../src/components/forms/FormInput'
import { fontSize, fontWeight, spacing, radius } from '../../src/theme'
import { changeLanguage } from '../../src/i18n'

export default function LoginScreen() {
  const { colors } = useTheme()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: t('errors.required') })
      return
    }
    setLoading(true)
    try {
      const res = await signIn({ email, password })
      if (res.user.businessId) {
        router.replace('/(app)/(tabs)/dashboard')
      } else {
        router.replace('/(app)/business/setup')
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>🍓</Text>
          <Text style={[styles.appName, { color: colors.brand }]}>Choco Berry</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('auth.tagline')}</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label={t('labels.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput
            label={t('labels.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            secureToggle
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, { backgroundColor: colors.brand, borderRadius: radius.md, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={[styles.loginBtnText, { color: '#fff' }]}>
              {loading ? '...' : t('auth.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.link, { color: colors.brand }]}>{t('auth.noAccount')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.langRow}>
          {(['tg', 'ru', 'en'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => changeLanguage(lang)}
              style={[
                styles.langBtn,
                {
                  backgroundColor: i18n.language === lang ? colors.brand : colors.surfaceAlt,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Text style={{ color: i18n.language === lang ? '#fff' : colors.textSecondary, fontWeight: fontWeight.medium }}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[6], justifyContent: 'center', gap: spacing[8] },
  hero: { alignItems: 'center', gap: spacing[2] },
  logo: { fontSize: 64 },
  appName: { fontSize: 32, fontWeight: fontWeight.extrabold },
  tagline: { fontSize: fontSize.base },
  form: { gap: spacing[4] },
  loginBtn: { padding: spacing[4], alignItems: 'center' },
  loginBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  link: { textAlign: 'center', fontSize: fontSize.base },
  langRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing[3] },
  langBtn: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
})
