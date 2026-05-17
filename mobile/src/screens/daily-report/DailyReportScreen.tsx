import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { dailyReportApi } from '../../api/daily-report.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

export function DailyReportScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['daily-report', 'list'],
    queryFn: () => dailyReportApi.list({ limit: 20 }),
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Ҳисоботи рӯзона" showBack
        right={
          <TouchableOpacity onPress={() => navigation.navigate('DailyReportForm', {})} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DailyReportDetail', { id: item.id })}>
            <Card style={styles.reportCard}>
              <View style={styles.reportRow}>
                <View>
                  <Text style={styles.reportDate}>{formatDate(item.date)}</Text>
                  <Badge label={item.isFinalized ? 'Тасдиқшуда' : 'Пешнавис'} variant={item.isFinalized ? 'success' : 'warning'} />
                </View>
                <View style={styles.reportStats}>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Даромад</Text>
                    <MoneyText amount={item.totalIncome} size={FontSize.sm} color={Colors.success} />
                  </View>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Хароҷот</Text>
                    <MoneyText amount={item.totalExpenses} size={FontSize.sm} color={Colors.error} />
                  </View>
                  <View style={[styles.statLine, styles.remainLine]}>
                    <Text style={[styles.statLabel, { fontWeight: FontWeight.bold }]}>Боқимонда</Text>
                    <MoneyText amount={item.remaining} size={FontSize.md} color={Colors.brand} />
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Ҳисобот нест"
            subtitle="Аввалин ҳисоботро эҷод кунед"
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  reportCard: {},
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportDate: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 6 },
  reportStats: { alignItems: 'flex-end', gap: 4 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  remainLine: { paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 2 },
})
