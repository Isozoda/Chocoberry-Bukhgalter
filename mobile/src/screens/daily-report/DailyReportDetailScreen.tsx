import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRoute, type RouteProp } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { dailyReportApi } from '../../api/daily-report.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Route = RouteProp<MoreStackParamList, 'DailyReportDetail'>

export function DailyReportDetailScreen() {
  const insets = useSafeAreaInsets()
  const { params } = useRoute<Route>()
  const queryClient = useQueryClient()

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['daily-report', params.id],
    queryFn: () => dailyReportApi.getById(params.id),
  })

  const finalizeMut = useMutation({
    mutationFn: () => dailyReportApi.finalize(params.id),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Ҳисобот тасдиқ шуд' })
      queryClient.invalidateQueries({ queryKey: ['daily-report'] })
    },
  })

  if (!report) return null

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={`Ҳисоботи ${formatDate(report.date)}`} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        <View style={styles.statusRow}>
          <Badge label={report.isFinalized ? 'Тасдиқшуда' : 'Пешнавис'} variant={report.isFinalized ? 'success' : 'warning'} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>💵 Даромад</Text>
          {[
            { label: 'Ҳамаи фурӯш', value: report.totalSales },
            { label: 'Нақд', value: report.cashSales },
            { label: 'Корт', value: report.cardSales },
            { label: 'Даромади иловагӣ', value: report.extraIncome },
          ].map(({ label, value }) => (
            <View key={label} style={styles.line}>
              <Text style={styles.lineLabel}>{label}</Text>
              <MoneyText amount={value} size={FontSize.sm} color={Colors.success} />
            </View>
          ))}
          <View style={[styles.line, styles.totalLine]}>
            <Text style={[styles.lineLabel, { fontWeight: FontWeight.bold }]}>Ҳамаи даромад</Text>
            <MoneyText amount={report.totalIncome} size={FontSize.lg} color={Colors.success} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>💸 Хароҷот</Text>
          {[
            { label: 'Таъминкунандагон', value: report.suppliersTotal },
            { label: 'Оператсионӣ', value: report.operationalExp },
            { label: 'Истеъмолиҳо', value: report.consumablesExp },
            { label: 'Хароҷоти соҳиб', value: report.ownerDraws },
          ].map(({ label, value }) => (
            <View key={label} style={styles.line}>
              <Text style={styles.lineLabel}>{label}</Text>
              <MoneyText amount={value} size={FontSize.sm} color={Colors.error} />
            </View>
          ))}
          <View style={[styles.line, styles.totalLine]}>
            <Text style={[styles.lineLabel, { fontWeight: FontWeight.bold }]}>Ҳамаи хароҷот</Text>
            <MoneyText amount={report.totalExpenses} size={FontSize.lg} color={Colors.error} />
          </View>
        </Card>

        <Card>
          <View style={styles.line}>
            <Text style={styles.lineLabel}>Хайрия</Text>
            <MoneyText amount={report.charityAmount} size={FontSize.sm} color={Colors.violet} />
          </View>
          <View style={[styles.line, styles.totalLine]}>
            <Text style={[styles.lineLabel, { fontWeight: FontWeight.bold, fontSize: FontSize.lg }]}>Боқимонда</Text>
            <MoneyText amount={report.remaining} size={FontSize.xxl} color={Colors.brand} />
          </View>
        </Card>

        {!report.isFinalized && (
          <Button
            title={finalizeMut.isPending ? 'Тасдиқ шудан...' : '✅ Тасдиқ кун'}
            onPress={() => finalizeMut.mutate()}
            loading={finalizeMut.isPending}
            fullWidth
            style={{ height: 52 }}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  statusRow: { flexDirection: 'row' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  lineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalLine: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.sm },
})
