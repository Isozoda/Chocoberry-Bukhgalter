import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../../src/theme'
import { businessApi } from '../../../src/api/business.api'
import { useAuthStore } from '../../../src/store/auth.store'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { FormInput } from '../../../src/components/forms/FormInput'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function BusinessSetupScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { setBusinessId } = useAuthStore()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('Choco Berry')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [bonusPct, setBonusPct] = useState('2.0')
  const [result, setResult] = useState<any>(null)

  const setupMutation = useMutation({
    mutationFn: businessApi.setup,
    onSuccess: (business) => {
      setBusinessId(business.id)
      setResult(business)
      setStep(3)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e.message }),
  })

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 && (
          <>
            <Text style={styles.logo}>🍓</Text>
            <Text style={[styles.title, { color: colors.brand }]}>{t('business.setupWelcome')}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{t('business.setupDesc')}</Text>

            <View style={styles.form}>
              <FormInput label={t('labels.name')} value={name} onChangeText={setName} />
              <FormInput label={t('business.address')} value={address} onChangeText={setAddress} />
              <FormInput label={t('labels.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <MoneyInput label={t('business.bonusPercentage')} value={bonusPct} onChangeText={setBonusPct} suffix="%" />
            </View>

            <TouchableOpacity onPress={() => setStep(2)} style={[styles.btn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}>
              <Text style={[styles.btnText, { color: '#fff' }]}>{t('actions.confirm')}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.logo}>🍓</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('business.autoCreate')}</Text>

            <View style={[styles.autoCard, { backgroundColor: colors.surfaceAlt, borderRadius: radius.xl }]}>
              {[
                '✅ ' + t('business.suppliers4') + ' (Аки Талабшоҳ, Шоколадфурӯш, Намк, Баҳрулло)',
                '✅ ' + t('business.items20') + ' (мева, шоколад, расходник)',
                '✅ ' + t('business.products5'),
                '✅ ' + t('business.employees5') + ' (Ман, Дилшод, Саф, Намк, Баҳрулло)',
                '✅ ' + t('business.allCategories'),
              ].map((item, i) => (
                <Text key={i} style={[styles.autoItem, { color: colors.textPrimary }]}>{item}</Text>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setupMutation.mutate({ name, type: 'FOOD', address: address || undefined, phone: phone || undefined, bonusPercentage: bonusPct })}
              disabled={setupMutation.isPending}
              style={[styles.btn, { backgroundColor: colors.brand, borderRadius: radius.lg, opacity: setupMutation.isPending ? 0.7 : 1 }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>
                {setupMutation.isPending ? '...' : `🍓 ${t('business.launch')}`}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={{ fontSize: 80, textAlign: 'center' }}>🎉</Text>
            <Text style={[styles.title, { color: colors.brand }]}>{t('business.ready')}</Text>

            <View style={[styles.statsRow, { backgroundColor: colors.surfaceAlt, borderRadius: radius.xl }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.brand }]}>20+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>мавод</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.brand }]}>5</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>маҳсулот</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.brand }]}>5</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>корманд</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.replace('/(app)/(tabs)/dashboard')}
              style={[styles.btn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>{t('business.goToDashboard')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[6], justifyContent: 'center', gap: spacing[6], alignItems: 'center' },
  logo: { fontSize: 80, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: fontWeight.extrabold, textAlign: 'center' },
  desc: { fontSize: fontSize.base, textAlign: 'center' },
  form: { width: '100%', gap: spacing[4] },
  btn: { width: '100%', padding: spacing[5], alignItems: 'center' },
  btnText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  autoCard: { width: '100%', padding: spacing[5], gap: spacing[3] },
  autoItem: { fontSize: fontSize.base, lineHeight: 24 },
  statsRow: { flexDirection: 'row', padding: spacing[5], gap: spacing[4], width: '100%' },
  statItem: { flex: 1, alignItems: 'center', gap: spacing[1] },
  statNum: { fontSize: 32, fontWeight: fontWeight.extrabold },
  statLabel: { fontSize: fontSize.sm },
})
