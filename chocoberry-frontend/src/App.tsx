import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// Dashboard
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

// Business
const BusinessSetupPage = lazy(() => import('@/pages/business/BusinessSetupPage'))
const BusinessProfilePage = lazy(() => import('@/pages/business/BusinessProfilePage'))

// Suppliers
const SuppliersPage = lazy(() => import('@/pages/suppliers/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('@/pages/suppliers/SupplierDetailPage'))

// Products
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'))

// Inventory
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'))
const InventoryItemDetail = lazy(() => import('@/pages/inventory/InventoryItemDetail'))
const InventoryValuation = lazy(() => import('@/pages/inventory/InventoryValuation'))

// Sales
const SalesPage = lazy(() => import('@/pages/sales/SalesPage'))
const CashierPOSPage = lazy(() => import('@/pages/sales/CashierPOSPage'))

// Expenses
const ExpensesPage = lazy(() => import('@/pages/expenses/ExpensesPage'))
const FixedExpensesPage = lazy(() => import('@/pages/fixed-expenses/FixedExpensesPage'))

// Employees
const EmployeesPage = lazy(() => import('@/pages/employees/EmployeesPage'))
const EmployeeDetailPage = lazy(() => import('@/pages/employees/EmployeeDetailPage'))

// Attendance
const AttendancePage = lazy(() => import('@/pages/attendance/AttendancePage'))

// Cashbox
const CashboxPage = lazy(() => import('@/pages/cashbox/CashboxPage'))

// Funds
const FundsPage = lazy(() => import('@/pages/funds/FundsPage'))

// Daily Report
const DailyReportPage = lazy(() => import('@/pages/daily-report/DailyReportPage'))
const DailyReportForm = lazy(() => import('@/pages/daily-report/DailyReportForm'))
const DailyReportDetail = lazy(() => import('@/pages/daily-report/DailyReportDetail'))

// Reports
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))

// AI
const AIPage = lazy(() => import('@/pages/ai/AIPage'))

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Wrap><LoginPage /></Wrap>} />
        <Route path="/register" element={<Wrap><RegisterPage /></Wrap>} />
        <Route path="/setup" element={<Wrap><BusinessSetupPage /></Wrap>} />

        {/* Protected routes inside AppShell */}
        <Route path="/app" element={<ProtectedRoute />}>
          {/* Cashier-only full-screen POS, no sidebar/header */}
          <Route path="pos" element={<Wrap><CashierPOSPage /></Wrap>} />

          <Route element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Wrap><DashboardPage /></Wrap>} />
            <Route path="business" element={<Wrap><BusinessProfilePage /></Wrap>} />

            <Route path="suppliers" element={<Wrap><SuppliersPage /></Wrap>} />
            <Route path="suppliers/:id" element={<Wrap><SupplierDetailPage /></Wrap>} />

            <Route path="products" element={<Wrap><ProductsPage /></Wrap>} />
            <Route path="products/:id" element={<Wrap><ProductDetailPage /></Wrap>} />

            <Route path="inventory" element={<Wrap><InventoryPage /></Wrap>} />
            <Route path="inventory/valuation" element={<Wrap><InventoryValuation /></Wrap>} />
            <Route path="inventory/:id" element={<Wrap><InventoryItemDetail /></Wrap>} />

            <Route path="sales" element={<Wrap><SalesPage /></Wrap>} />

            <Route path="expenses" element={<Wrap><ExpensesPage /></Wrap>} />
            <Route path="expenses/fixed" element={<Wrap><FixedExpensesPage /></Wrap>} />

            <Route path="employees" element={<Wrap><EmployeesPage /></Wrap>} />
            <Route path="employees/:id" element={<Wrap><EmployeeDetailPage /></Wrap>} />

            <Route path="attendance" element={<Wrap><AttendancePage /></Wrap>} />

            <Route path="cashbox" element={<Wrap><CashboxPage /></Wrap>} />

            <Route path="funds" element={<Wrap><FundsPage /></Wrap>} />

            <Route path="daily-report" element={<Wrap><DailyReportPage /></Wrap>} />
            <Route path="daily-report/new" element={<Wrap><DailyReportForm /></Wrap>} />
            <Route path="daily-report/:id" element={<Wrap><DailyReportDetail /></Wrap>} />

            <Route path="reports" element={<Wrap><ReportsPage /></Wrap>} />

            <Route path="ai" element={<Wrap><AIPage /></Wrap>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
