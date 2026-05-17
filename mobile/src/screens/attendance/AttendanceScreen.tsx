import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import { attendanceApi } from '../../api/attendance.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { MoneyText } from '../../components/ui/MoneyText'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { AttendanceStatus } from '../../types/attendance.types'

const STATUSES: { key: AttendanceStatus; label: string; color: string }[] = [
  { key: 'PRESENT', label: 'Ҳозир', color: Colors.success },
  { key: 'ABSENT', label: 'Ғоиб', color: Colors.error },
  { key: 'LATE', label: 'Дер', color: Colors.warning },
  { key: 'HALF_DAY', label: 'Нимрӯз', color: Colors.info },
  { key: 'DAY_OFF', label: 'Истироҳат', color: Colors.textSecondary },
  { key: 'SICK', label: 'Бемор', color: Colors.violet },
]

function getStatusLabel(status: AttendanceStatus) {
  return STATUSES.find((s) => s.key === status)?.label ?? status
}
function getStatusColor(status: AttendanceStatus | undefined) {
  return STATUSES.find((s) => s.key === status)?.color ?? Colors.textTertiary
}

export function AttendanceScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [markModal, setMarkModal] = useState<{ employeeId: string; name: string } | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('PRESENT')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance', 'daily', date],
    queryFn: () => attendanceApi.getDaily(date),
  })

  const upsertMut = useMutation({
    mutationFn: ({ employeeId }: { employeeId: string }) =>
      attendanceApi.upsert(employeeId, { date, status: selectedStatus }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Ҳозирӣ қайд шуд' })
      setMarkModal(null)
      queryClient.invalidateQueries({ queryKey: ['attendance', 'daily', date] })
    },
  })

  const prevDay = () => setDate(dayjs(date).subtract(1, 'day').format('YYYY-MM-DD'))
  const nextDay = () => setDate(dayjs(date).add(1, 'day').format('YYYY-MM-DD'))

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Ҳозирӣ" showBack />

      {/* Date Navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={prevDay} style={styles.dateBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.brand} />
        </TouchableOpacity>
        <Text style={styles.dateLabel}>{dayjs(date).format('DD MMMM YYYY')}</Text>
        <TouchableOpacity onPress={nextDay} style={styles.dateBtn}>
          <Ionicons name="chevron-forward" size={20} color={Colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {data && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{data.present}</Text>
            <Text style={styles.summaryLabel}>Ҳозир</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.error }]}>{data.absent}</Text>
            <Text style={styles.summaryLabel}>Ғоиб</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{data.total}</Text>
            <Text style={styles.summaryLabel}>Ҳамагӣ</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {(data?.employees ?? []).map(({ employee, record }) => (
          <TouchableOpacity
            key={employee.id}
            onPress={() => { setMarkModal({ employeeId: employee.id, name: employee.name }); setSelectedStatus(record?.status ?? 'PRESENT') }}
          >
            <Card style={styles.empCard}>
              <View style={styles.empRow}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empAvatarText}>{employee.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.empName}>{employee.name}</Text>
                  <Text style={styles.empRole}>{employee.role}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(record?.status)}20` }]}>
                  <Text style={[styles.statusChipText, { color: getStatusColor(record?.status) }]}>
                    {record ? getStatusLabel(record.status) : '—'}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mark Modal */}
      <Modal visible={!!markModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{markModal?.name}</Text>
            <Text style={styles.modalSubtitle}>Ҳолатро интихоб кунед</Text>
            <View style={styles.statusGrid}>
              {STATUSES.map(({ key, label, color }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.statusBtn, { borderColor: color }, selectedStatus === key && { backgroundColor: `${color}20` }]}
                  onPress={() => setSelectedStatus(key)}
                >
                  <Text style={[styles.statusBtnText, { color }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setMarkModal(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Бекор кун</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => markModal && upsertMut.mutate({ employeeId: markModal.employeeId })}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmText}>Сабт кун</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  dateNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  dateBtn: { padding: 8 },
  dateLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  summary: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  content: { padding: Spacing.md, gap: Spacing.sm },
  empCard: {},
  empRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  empAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  empAvatarText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.brand },
  empName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  empRole: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  statusChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xxl,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  statusBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.surfaceSecondary, alignItems: 'center' },
  cancelText: { fontSize: FontSize.md, color: Colors.text },
  confirmBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.brand, alignItems: 'center' },
  confirmText: { fontSize: FontSize.md, color: '#fff', fontWeight: FontWeight.semibold },
})
