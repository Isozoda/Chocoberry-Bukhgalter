import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type HomeTabParamList = {
  DashboardTab: undefined
  SalesTab: undefined
  InventoryTab: undefined
  StaffTab: undefined
  MoreTab: undefined
}

export type DashboardStackParamList = {
  Dashboard: undefined
}

export type SalesStackParamList = {
  Sales: undefined
}

export type InventoryStackParamList = {
  Inventory: undefined
  InventoryDetail: { id: string }
  InventoryValuation: undefined
}

export type StaffStackParamList = {
  Employees: undefined
  EmployeeDetail: { id: string }
  Attendance: undefined
}

export type MoreStackParamList = {
  More: undefined
  Suppliers: undefined
  SupplierDetail: { id: string }
  Products: undefined
  ProductDetail: { id: string }
  Expenses: undefined
  FixedExpenses: undefined
  Cashbox: undefined
  Funds: undefined
  DailyReport: undefined
  DailyReportForm: { id?: string }
  DailyReportDetail: { id: string }
  Reports: undefined
  AIAdvisor: undefined
  Settings: undefined
  BusinessProfile: undefined
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}
