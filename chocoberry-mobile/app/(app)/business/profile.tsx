import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../../src/theme'
import { useThemeStore } from '../../../src/store/theme.store'
import { businessApi } from '../../../src/api/business.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { FormInput } from '../../../src/components/forms/FormInput'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { changeLanguage } from '../../../src/i18n'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function BusinessProfileScreen() {
  const { colors } = useTheme()
  const { mode, toggle } = useThemeStore()
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const { data: business } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessApi.profile,
  })

  const [name, setName] = useState(business?.name ?? '')
  const [address, setAddress] = useState(business?.address ?? '')
  const [phone, setPhone] = useState(business?.phone ?? '')
  const [bonusPct, setBonusPct] = useState(business?.bonusPercentage ?? '2')

  const updateMutation = useMutation({
    mutationFn: () => businessApi.updateProfile({ name, address: address || undefined, phone: phone || undefined, bonusPercentage: bonusPct }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profile'] })
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  return (
    <ScreenWrapper>
      <Header title={t('business.profile')} />

      <View style={styles.container}>
        <FormInput label={t('labels.name')} value={name || business?.name || ''} onChangeText={setName} />
        <FormInput label={t('business.address')} value={address || business?.address || ''} onChangeText={setAddress} />
        <FormInput label={t('labels.phone')} value={phone || business?.phone || ''} onChangeText={setPhone} keyboardType="phone-pad" />
        <MoneyInput label={t('business.bonusPercentage')} value={bonusPct || business?.bonusPercentage || ''} onChangeText={setBonusPct} suffix="%" />

        {/* Language */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('more.language')}</Text>
          <View style={styles.langBtns}>
            {(['tg', 'ru', 'en'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => changeLanguage(lang)}
                style={[styles.langBtn, { backgroundColor: i18n.language === lang ? colors.brand : colors.surfaceAlt, borderRadius: radius.sm }]}
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
          <TouchableOpacity onPress={toggle} style={[styles.themeBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
            <Text style={{ color: colors.textPrimary }}>
              {mode === 'dark' ? `🌙 ${t('more.themeDark')}` : `☀️ ${t('more.themeLight')}`}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          style={[styles.saveBtn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}
        >
          <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
            {updateMutation.isPending ? '...' : t('actions.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing[4], gap: spacing[4] },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3] },
  settingLabel: { fontSize: fontSize.base },
  langBtns: { flexDirection: 'row', gap: spacing[2] },
  langBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  themeBtn: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  saveBtn: { padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
})
