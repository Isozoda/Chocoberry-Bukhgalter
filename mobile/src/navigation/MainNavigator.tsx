import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Colors } from '../theme/colors'

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen'
import { SalesScreen } from '../screens/sales/SalesScreen'
import { InventoryScreen } from '../screens/inventory/InventoryScreen'
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen'
import { InventoryValuationScreen } from '../screens/inventory/InventoryValuationScreen'
import { EmployeesScreen } from '../screens/employees/EmployeesScreen'
import { EmployeeDetailScreen } from '../screens/employees/EmployeeDetailScreen'
import { AttendanceScreen } from '../screens/attendance/AttendanceScreen'
import { MoreScreen } from '../screens/more/MoreScreen'
import { SuppliersScreen } from '../screens/suppliers/SuppliersScreen'
import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen'
import { ProductsScreen } from '../screens/products/ProductsScreen'
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen'
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen'
import { FixedExpensesScreen } from '../screens/expenses/FixedExpensesScreen'
import { CashboxScreen } from '../screens/cashbox/CashboxScreen'
import { FundsScreen } from '../screens/funds/FundsScreen'
import { DailyReportScreen } from '../screens/daily-report/DailyReportScreen'
import { DailyReportFormScreen } from '../screens/daily-report/DailyReportFormScreen'
import { DailyReportDetailScreen } from '../screens/daily-report/DailyReportDetailScreen'
import { ReportsScreen } from '../screens/reports/ReportsScreen'
import { AIScreen } from '../screens/ai/AIScreen'
import { SettingsScreen } from '../screens/settings/SettingsScreen'
import { BusinessProfileScreen } from '../screens/settings/BusinessProfileScreen'

import type {
  HomeTabParamList, DashboardStackParamList, SalesStackParamList,
  InventoryStackParamList, StaffStackParamList, MoreStackParamList
} from './types'

const Tab = createBottomTabNavigator<HomeTabParamList>()
const DashStack = createNativeStackNavigator<DashboardStackParamList>()
const SalesStack = createNativeStackNavigator<SalesStackParamList>()
const InvStack = createNativeStackNavigator<InventoryStackParamList>()
const StaffStack = createNativeStackNavigator<StaffStackParamList>()
const MoreStack = createNativeStackNavigator<MoreStackParamList>()

function DashboardNavigator() {
  return (
    <DashStack.Navigator>
      <DashStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    </DashStack.Navigator>
  )
}

function SalesNavigator() {
  return (
    <SalesStack.Navigator>
      <SalesStack.Screen name="Sales" component={SalesScreen} options={{ headerShown: false }} />
    </SalesStack.Navigator>
  )
}

function InventoryNavigator() {
  return (
    <InvStack.Navigator>
      <InvStack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: false }} />
      <InvStack.Screen name="InventoryDetail" component={InventoryDetailScreen} options={{ headerShown: false }} />
      <InvStack.Screen name="InventoryValuation" component={InventoryValuationScreen} options={{ headerShown: false }} />
    </InvStack.Navigator>
  )
}

function StaffNavigator() {
  return (
    <StaffStack.Navigator>
      <StaffStack.Screen name="Employees" component={EmployeesScreen} options={{ headerShown: false }} />
      <StaffStack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} options={{ headerShown: false }} />
      <StaffStack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
    </StaffStack.Navigator>
  )
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="More" component={MoreScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Suppliers" component={SuppliersScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="SupplierDetail" component={SupplierDetailScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Products" component={ProductsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="FixedExpenses" component={FixedExpensesScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Cashbox" component={CashboxScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Funds" component={FundsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="DailyReport" component={DailyReportScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="DailyReportForm" component={DailyReportFormScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="DailyReportDetail" component={DailyReportDetailScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="AIAdvisor" component={AIScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="BusinessProfile" component={BusinessProfileScreen} options={{ headerShown: false }} />
    </MoreStack.Navigator>
  )
}

export function MainNavigator() {
  const { t } = useTranslation('common')
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{
          title: 'Бош',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SalesTab"
        component={SalesNavigator}
        options={{
          title: 'Фурӯш',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryNavigator}
        options={{
          title: 'Захира',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="StaffTab"
        component={StaffNavigator}
        options={{
          title: 'Кормандон',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        options={{
          title: 'Бештар',
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
