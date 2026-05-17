import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import dayjs from 'dayjs'
import { dailyReportApi } from '../../api/daily-report.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

export function DailyReportFormScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const queryClient = useQueryClient()

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      totalSales: '',
      cashSales: '',
      cardSales: '',
      operationalExp: '',
      suppliersCost: '',
      consumablesExp: '',
      ownerDraw: '',
      charityAmount: '',
      notes: '',
    },
  })

  const createMut = useMutation({
    mutationFn: (d: any) => dailyReportApi.create({
      date: d.date,
      totalSales: d.totalSales,
      operationalExp: d.operationalExp,
      charityAmount: d.charityAmount,
      notes: d.notes,
      supplierPurchases: d.suppliersCost ? [{ name: 'Харидорӣ', amount: d.suppliersCost }] : undefined,
      consumables: d.consumablesExp ? [{ label: 'Истеъмол', amount: d.consumablesExp }] : undefined,
      ownerDraws: d.ownerDraw ? [{ ownerName: 'Соҳиб', amount: d.ownerDraw }] : undefined,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Ҳисобот сабт шуд' })
      queryClient.invalidateQueries({ queryKey: ['daily-report'] })
      navigation.goBack()
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Ҳисоботи рӯзона" showBack />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.sectionTitle}>📅 Сана</Text>
          <Controller control={control} name="date"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Сана" value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" />
            )}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>💵 Даромад</Text>
          <View style={styles.fields}>
            <Controller control={control} name="totalSales"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Ҳамаи фурӯш (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="cashSales"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Фурӯши нақд (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="cardSales"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Фурӯши корт (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>💸 Хароҷот</Text>
          <View style={styles.fields}>
            <Controller control={control} name="suppliersCost"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Хариди таъминкунандагон (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="operationalExp"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Хароҷоти оператсионӣ (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="consumablesExp"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Истеъмолиҳо (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="ownerDraw"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Хароҷоти соҳиб (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>🕌 Хайрия ва эзоҳ</Text>
          <View style={styles.fields}>
            <Controller control={control} name="charityAmount"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Хайрия (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
              )}
            />
            <Controller control={control} name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Эзоҳ" value={value} onChangeText={onChange} placeholder="Ихтиёрӣ" />
              )}
            />
          </View>
        </Card>

        <Button
          title={createMut.isPending ? 'Сабт шудан...' : 'Ҳисоботро сабт кун'}
          onPress={handleSubmit((d) => createMut.mutate(d))}
          loading={createMut.isPending}
          fullWidth
          style={{ height: 52 }}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  fields: { gap: Spacing.md },
})
