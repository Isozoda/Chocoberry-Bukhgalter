import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../../src/theme'
import { employeesApi } from '../../../src/api/employees.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function EmployeesScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()

  const { data: employees, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  })

  const owners = (employees ?? []).filter((e) => e.isOwner)
  const staff = (employees ?? []).filter((e) => !e.isOwner)

  if (isLoading) return <LoadingSkeleton />

  const renderEmployee = React.useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/employees/${item.id}` as any)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.brandLight }]}>
        <Text style={[styles.avatarText, { color: colors.brand }]}>{item.name[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
          {item.isOwner && <Badge label={t('employees.isOwner')} variant="warning" />}
          {item.isConsumableBuyer && <Badge label="Расходник" variant="info" />}
        </View>
        <Text style={[styles.position, { color: colors.textSecondary }]}>{item.position}</Text>
        <MoneyText amount={item.baseSalary} size={fontSize.sm} color={colors.textSecondary} />
      </View>
      <TouchableOpacity
        onPress={() => router.push(`/(app)/employees/pay?id=${item.id}` as any)}
        style={[styles.payBtn, { backgroundColor: colors.greenLight, borderRadius: radius.md }]}
      >
        <Text style={{ color: colors.green, fontWeight: fontWeight.semibold, fontSize: fontSize.xs }}>
          {t('employees.addPayment')}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [colors, t, router])

  return (
    <ScreenWrapper scroll={false}>
      <Header
        title={t('nav.employees')}
        showBack={false}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/(app)/employees/payroll')}
            style={[styles.headerBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}
          >
            <Ionicons name="calculator" size={20} color={colors.brand} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={[...owners, ...staff]}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={renderEmployee}
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {t('employees.owners')}: {owners.length} · {t('employees.staff')}: {staff.length}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isError ? (
            <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetch} retryLabel={t('actions.retry')} />
          ) : (
            <EmptyState message={t('empty.noEmployees')} />
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  list: { padding: spacing[4], gap: spacing[3] },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[3] },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  name: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  position: { fontSize: fontSize.xs, marginTop: 2 },
  payBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  summary: { paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  summaryText: { fontSize: fontSize.sm },
  headerBtn: { padding: spacing[2], marginLeft: spacing[2] },
})
