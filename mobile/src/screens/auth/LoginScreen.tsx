import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/auth.store'
import { TextInput } from '../../components/ui/TextInput'
import { Button } from '../../components/ui/Button'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { AuthStackParamList } from '../../navigation/types'

const schema = z.object({
  email: z.string().email('Почтаи дуруст ворид кунед'),
  password: z.string().min(6, 'Рамз ҳадди ақал 6 аломат'),
})
type Form = z.infer<typeof schema>

export function LoginScreen() {
  const { t } = useTranslation('auth')
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { login } = useAuthStore()

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await login(data.accessToken, data.user)
      Toast.show({ type: 'success', text1: t('welcomeBack') })
    },
    onError: () => {},
  })

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header branding */}
        <View style={styles.brandingHeader}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🍫</Text>
          </View>
          <Text style={styles.appName}>Choco Berry</Text>
          <Text style={styles.tagline}>Идоракунии тиҷорат</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('login')}</Text>
          <Text style={styles.cardSubtitle}>Ба аккаунти худ ворид шавед</Text>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('email')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  placeholder="email@example.com"
                  error={errors.email?.message}
                  leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('password')}
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  isPassword
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
          </View>

          <Button
            title={loginMutation.isPending ? 'Ворид шудан...' : t('loginBtn')}
            onPress={handleSubmit((d) => loginMutation.mutate(d))}
            loading={loginMutation.isPending}
            fullWidth
            style={styles.loginBtn}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchLink}>Ба қайд гиред</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature bullets */}
        <View style={styles.features}>
          {[
            { icon: 'trending-up-outline', label: 'Назорати фурӯш' },
            { icon: 'bar-chart-outline', label: 'Таҳлили маълумот' },
            { icon: 'people-outline', label: 'Идоракунии кормандон' },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={icon as any} size={14} color={Colors.brand} />
              </View>
              <Text style={styles.featureLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  brandingHeader: { alignItems: 'center', paddingVertical: Spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoText: { fontSize: 36 },
  appName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  cardSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  fields: { gap: Spacing.md },
  loginBtn: { marginTop: Spacing.xl, borderRadius: Radius.md, height: 50 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  switchText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: FontWeight.semibold },
  features: { marginTop: Spacing.xxl, gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
})
