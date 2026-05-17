import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../src/theme'
import { useAuth } from '../../src/hooks/useAuth'
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper'
import { FormInput } from '../../src/components/forms/FormInput'
import { fontSize, fontWeight, spacing, radius } from '../../src/theme'

export default function RegisterScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: t('errors.required') })
      return
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: t('errors.passwordMismatch') })
      return
    }
    setLoading(true)
    try {
      await signUp({ name, email, password })
      router.replace('/(app)/business/setup')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('auth.register')}</Text>

        <View style={styles.form}>
          <FormInput label={t('labels.name')} value={name} onChangeText={setName} />
          <FormInput label={t('labels.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <FormInput label={t('labels.password')} value={password} onChangeText={setPassword} secureTextEntry secureToggle />
          <FormInput label={t('labels.confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry secureToggle />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.btn, { backgroundColor: colors.brand, borderRadius: radius.md, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>
              {loading ? '...' : t('auth.register')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.brand }]}>{t('auth.hasAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[6], justifyContent: 'center', gap: spacing[6] },
  title: { fontSize: 28, fontWeight: fontWeight.bold, textAlign: 'center' },
  form: { gap: spacing[4] },
  btn: { padding: spacing[4], alignItems: 'center' },
  btnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  link: { textAlign: 'center', fontSize: fontSize.base },
})
