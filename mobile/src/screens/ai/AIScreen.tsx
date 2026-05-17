import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { aiApi } from '../../api/ai.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'

type AdviceItem = { id: string; type: string; question?: string; content: string; createdAt: string }

export function AIScreen() {
  const insets = useSafeAreaInsets()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [weeklyAdvice, setWeeklyAdvice] = useState<string | null>(null)

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['ai', 'history'],
    queryFn: () => aiApi.getHistory(),
  })

  const weeklyMut = useMutation({
    mutationFn: () => aiApi.weeklyAdvice(),
    onSuccess: (res: any) => {
      const advice = res?.advice ?? res?.content ?? res?.message ?? JSON.stringify(res)
      setWeeklyAdvice(advice)
    },
    onError: () => Toast.show({ type: 'error', text1: 'Хатогӣ рух дод' }),
  })

  const askMut = useMutation({
    mutationFn: (q: string) => aiApi.askAdvisor(q),
    onSuccess: (res: any) => {
      const text = res?.answer ?? res?.content ?? res?.message ?? JSON.stringify(res)
      setAnswer(text)
      setQuestion('')
      refetch()
    },
    onError: () => Toast.show({ type: 'error', text1: 'Ҷавоб гирифта нашуд' }),
  })

  const historyItems: AdviceItem[] = Array.isArray(history) ? history : (history as any)?.data ?? []

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Маслиҳатгари AI" showBack />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* Weekly Advice */}
          <Card style={styles.advisorHeader}>
            <View style={styles.advisorIcon}>
              <Text style={{ fontSize: 36 }}>🤖</Text>
            </View>
            <Text style={styles.advisorTitle}>AI Маслиҳатгар</Text>
            <Text style={styles.advisorSubtitle}>Таҳлили тиҷорат ва маслиҳатҳои ҳафтагӣ</Text>
            <Button
              title={weeklyMut.isPending ? 'Таҳлил шудан...' : '✨ Маслиҳати ҳафтагӣ'}
              onPress={() => { setWeeklyAdvice(null); weeklyMut.mutate() }}
              loading={weeklyMut.isPending}
              variant="primary"
              size="md"
              style={{ marginTop: Spacing.md }}
            />
          </Card>

          {weeklyAdvice && (
            <Card style={styles.adviceCard}>
              <View style={styles.adviceHeader}>
                <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
                <Text style={styles.adviceTitle}>Маслиҳати ҳафтагӣ</Text>
              </View>
              <Text style={styles.adviceText}>{weeklyAdvice}</Text>
            </Card>
          )}

          {/* Ask Question */}
          <Card>
            <Text style={styles.sectionTitle}>💬 Савол диҳед</Text>
            <View style={styles.inputRow}>
              <RNTextInput
                style={styles.questionInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="Масалан: Чӣ тавр фурӯшро зиёд кунам?"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <Button
              title={askMut.isPending ? 'Фиристодан...' : 'Фиристодан'}
              onPress={() => {
                if (!question.trim()) return
                setAnswer(null)
                askMut.mutate(question.trim())
              }}
              loading={askMut.isPending}
              disabled={!question.trim()}
              fullWidth
            />
          </Card>

          {answer && (
            <Card style={styles.answerCard}>
              <View style={styles.adviceHeader}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.brand} />
                <Text style={[styles.adviceTitle, { color: Colors.brand }]}>Ҷавоб</Text>
              </View>
              <Text style={styles.adviceText}>{answer}</Text>
            </Card>
          )}

          {/* Analysis Shortcuts */}
          <Card>
            <Text style={styles.sectionTitle}>📊 Таҳлили зуд</Text>
            <View style={styles.shortcutGrid}>
              {[
                { label: '7 рӯзи охир', period: 'week', icon: '📅' },
                { label: 'Ин моҳ', period: 'month', icon: '📆' },
                { label: 'Пешгӯии захира', period: null, icon: '📦' },
              ].map(({ label, period, icon }) => (
                <TouchableOpacity
                  key={label}
                  style={styles.shortcutBtn}
                  onPress={() => {
                    if (period === null) {
                      aiApi.forecastInventory(7).then((res: any) => {
                        const text = res?.forecast ?? res?.content ?? JSON.stringify(res)
                        setAnswer(text)
                      }).catch(() => Toast.show({ type: 'error', text1: 'Хатогӣ' }))
                    } else {
                      aiApi.analyzeSales(period).then((res: any) => {
                        const text = res?.analysis ?? res?.content ?? JSON.stringify(res)
                        setAnswer(text)
                      }).catch(() => Toast.show({ type: 'error', text1: 'Хатогӣ' }))
                    }
                  }}
                >
                  <Text style={styles.shortcutIcon}>{icon}</Text>
                  <Text style={styles.shortcutLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* History */}
          {historyItems.length > 0 && (
            <Card>
              <Text style={styles.sectionTitle}>🕐 Таърих</Text>
              {historyItems.slice(0, 10).map((item, idx) => (
                <View key={item.id ?? idx} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name={item.type === 'QUESTION' ? 'chatbubble-outline' : 'bulb-outline'}
                      size={14}
                      color={item.type === 'QUESTION' ? Colors.brand : Colors.warning}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {item.question && (
                      <Text style={styles.historyQuestion} numberOfLines={1}>{item.question}</Text>
                    )}
                    <Text style={styles.historyContent} numberOfLines={2}>{item.content}</Text>
                    <Text style={styles.historyDate}>{item.createdAt?.slice(0, 10) ?? ''}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  advisorHeader: { alignItems: 'center', paddingVertical: Spacing.xl },
  advisorIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  advisorTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  advisorSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.md },
  adviceCard: { borderLeftWidth: 3, borderLeftColor: Colors.warning },
  answerCard: { borderLeftWidth: 3, borderLeftColor: Colors.brand },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  adviceTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.warning },
  adviceText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  inputRow: { marginBottom: Spacing.md },
  questionInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text,
    backgroundColor: Colors.backgroundSecondary, minHeight: 80,
  },
  shortcutGrid: { flexDirection: 'row', gap: Spacing.sm },
  shortcutBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary, gap: 4,
  },
  shortcutIcon: { fontSize: 22 },
  shortcutLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  historyItem: {
    flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  historyIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center',
  },
  historyQuestion: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text },
  historyContent: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  historyDate: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
})
