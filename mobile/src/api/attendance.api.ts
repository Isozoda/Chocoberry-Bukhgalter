import api from './axios'
import type { DailyAttendanceResponse, MonthlyAttendanceResponse, AttendanceRecord, UpsertAttendanceDto } from '../types/attendance.types'

export const attendanceApi = {
  getDaily: (date: string): Promise<DailyAttendanceResponse> =>
    api.get('/attendance/daily', { params: { date } }),
  getMonthly: (month: string): Promise<MonthlyAttendanceResponse> =>
    api.get('/attendance/monthly', { params: { month } }),
  upsert: (employeeId: string, dto: UpsertAttendanceDto): Promise<AttendanceRecord> =>
    api.put(`/attendance/${employeeId}`, dto),
  deleteRecord: (employeeId: string, date: string): Promise<void> =>
    api.delete(`/attendance/${employeeId}/${date}`),
}
