╔══════════════════════════════════════════════════════════════════════════╗
║   CHOCO BERRY FRONTEND — COMPLETE REACT DASHBOARD v2.0                   ║
║   Production-Ready · All 12 Backend Modules · i18n · Dark/Light Mode     ║
║   shadcn/ui + TailwindCSS + MUI icons + Recharts + React Query           ║
╚══════════════════════════════════════════════════════════════════════════╝

You are a SENIOR React/TypeScript engineer building the complete frontend
for "CHOCO BERRY" — a strawberry dessert business dashboard in Tajikistan.
The NestJS backend already exists at http://localhost:3000/api/v1.
Swagger docs: http://localhost:3000/api/docs

⚠️ ABSOLUTE RULES — NON-NEGOTIABLE:
  ❌ NO TODOs, NO placeholder pages, NO "coming soon" content
  ❌ NO hardcoded data — every value must come from the API
  ❌ NO float arithmetic for money — use Decimal.js everywhere
  ❌ NO missing API integrations — every backend endpoint must be consumed
  Do not break or modify any logic.
  ✅ npm run build MUST succeed with 0 TypeScript errors
  ✅ Every page must be fully functional end-to-end
  ✅ Every form must have validation matching backend DTOs
  ✅ Every list must have pagination, sorting, filtering
  ✅ All money values rendered as "12,345.50 см" (TJS/Somoni)
  ✅ Dark mode and light mode work perfectly on every page
  ✅ i18n: Tajik (tg), Russian (ru), English (en) on EVERY string


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — TECH STACK (install EXACTLY these packages)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRAMEWORK INIT:
  npm create vite@latest chocoberry-frontend -- --template react-ts
  cd chocoberry-frontend

CORE DEPENDENCIES:
  npm install \
    react-router-dom@6 \
    @tanstack/react-query@5 \
    axios \
    zustand \
    react-hook-form \
    @hookform/resolvers \
    zod \
    decimal.js \
    dayjs \
    i18next \
    react-i18next \
    i18next-browser-languagedetector \
    recharts \
    @mui/icons-material \
    @mui/material \
    @emotion/react \
    @emotion/styled \
    react-hot-toast \
    clsx \
    tailwind-merge \
    lucide-react \
    @radix-ui/react-dialog \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-select \
    @radix-ui/react-tabs \
    @radix-ui/react-tooltip \
    @radix-ui/react-popover \
    @radix-ui/react-switch \
    @radix-ui/react-badge \
    @radix-ui/react-avatar \
    @radix-ui/react-progress \
    @radix-ui/react-separator \
    @radix-ui/react-slot \
    date-fns \
    react-day-picker \
    react-number-format

UI + STYLING:
  npm install -D \
    tailwindcss \
    postcss \
    autoprefixer \
    @types/node

  npx tailwindcss init -p
  npx shadcn@latest init   # choose: New York style, zinc color, CSS variables YES

  # Install ALL shadcn components:
  npx shadcn@latest add button card input label select textarea badge
  npx shadcn@latest add table dialog sheet drawer alert-dialog
  npx shadcn@latest add dropdown-menu popover tooltip
  npx shadcn@latest add form tabs separator skeleton avatar
  npx shadcn@latest add progress slider switch calendar
  npx shadcn@latest add command chart

.env:
  VITE_API_BASE_URL=http://localhost:3000/api/v1
  VITE_APP_NAME="Choco Berry"
  VITE_DEFAULT_LANG=tg
  VITE_CURRENCY=TJS
  VITE_CURRENCY_SYMBOL=см

tsconfig.json paths:
  "@/*": ["./src/*"]
  "@api/*": ["./src/api/*"]
  "@pages/*": ["./src/pages/*"]
  "@components/*": ["./src/components/*"]
  "@store/*": ["./src/store/*"]
  "@i18n/*": ["./src/i18n/*"]
  "@hooks/*": ["./src/hooks/*"]
  "@types/*": ["./src/types/*"]
  "@utils/*": ["./src/utils/*"]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — COMPLETE FILE STRUCTURE (create ALL files)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/
├── main.tsx                          # App entry: QueryClient, i18n, Router, ThemeProvider
├── App.tsx                           # Routes + layout wrapper
│
├── i18n/
│   ├── index.ts                      # i18next setup with detector
│   └── locales/
│       ├── tg/                       # Tajik translations
│       │   ├── common.json           # nav, buttons, labels
│       │   ├── dashboard.json
│       │   ├── sales.json
│       │   ├── inventory.json
│       │   ├── suppliers.json
│       │   ├── products.json
│       │   ├── expenses.json
│       │   ├── employees.json
│       │   ├── cashbox.json
│       │   ├── funds.json
│       │   ├── daily-report.json
│       │   ├── reports.json
│       │   └── business.json
│       ├── ru/                       # Russian (same keys)
│       └── en/                       # English (same keys)
│
├── types/
│   ├── auth.types.ts
│   ├── business.types.ts
│   ├── supplier.types.ts
│   ├── product.types.ts
│   ├── inventory.types.ts
│   ├── sale.types.ts
│   ├── expense.types.ts
│   ├── employee.types.ts
│   ├── cashbox.types.ts
│   ├── fund.types.ts
│   ├── daily-report.types.ts
│   ├── report.types.ts
│   └── api.types.ts                  # PaginatedResponse<T>, ApiResponse<T>
│
├── api/
│   ├── axios.ts                      # Axios instance + JWT interceptor + error handler
│   ├── auth.api.ts
│   ├── business.api.ts
│   ├── suppliers.api.ts
│   ├── products.api.ts
│   ├── inventory.api.ts
│   ├── sales.api.ts
│   ├── expenses.api.ts
│   ├── employees.api.ts
│   ├── cashbox.api.ts
│   ├── funds.api.ts
│   ├── daily-report.api.ts
│   └── reports.api.ts
│
├── store/
│   ├── auth.store.ts                 # user, token, isAuthenticated
│   ├── theme.store.ts                # 'dark' | 'light', toggle()
│   └── ui.store.ts                   # sidebar open/closed, active language
│
├── hooks/
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useCurrency.ts               # formatTJS(amount) → "12,345.50 см"
│   ├── useLanguage.ts               # changeLanguage, currentLang
│   ├── usePermissions.ts            # isOwner, isAdmin, isStaff
│   ├── usePagination.ts
│   └── useDebounce.ts
│
├── utils/
│   ├── decimal.util.ts              # toDecimal, formatMoney, addMoney, multiplyMoney
│   ├── date.util.ts                 # formatDate, startOfDay, endOfDay, getMonthRange
│   ├── validation.util.ts           # Zod schemas matching backend DTOs exactly
│   └── export.util.ts               # trigger download for Excel/PDF blobs
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Sidebar + Header + main content area
│   │   ├── Sidebar.tsx              # Nav links, logo, user info
│   │   ├── Header.tsx               # Breadcrumb, language switcher, theme toggle, user menu
│   │   ├── ProtectedRoute.tsx       # Redirect to /login if not authenticated
│   │   └── RoleGuard.tsx            # Show/hide by role
│   │
│   ├── ui/
│   │   ├── StatsCard.tsx            # KPI card: icon + value + change%
│   │   ├── MoneyDisplay.tsx         # "12,345.50 см" formatted with Decimal.js
│   │   ├── DataTable.tsx            # Reusable table: columns, pagination, sort, filter
│   │   ├── DateRangePicker.tsx      # from/to date picker
│   │   ├── ConfirmDialog.tsx        # "Are you sure?" modal
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx           # Icon + message when no data
│   │   ├── ErrorBoundary.tsx
│   │   ├── LowStockBadge.tsx        # Red badge when currentStock < minStockLevel
│   │   ├── PaymentMethodBadge.tsx   # CASH/CARD/MIXED chip
│   │   ├── StatusBadge.tsx          # COMPLETED/REFUNDED/VOID
│   │   └── PageHeader.tsx           # title + breadcrumb + action button
│   │
│   ├── forms/
│   │   ├── FormField.tsx            # shadcn FormField wrapper
│   │   ├── MoneyInput.tsx           # react-number-format for TJS amounts
│   │   ├── QuantityInput.tsx        # decimal quantity with unit label
│   │   └── EmployeeSelect.tsx       # async select for employee picker
│   │
│   └── charts/
│       ├── SalesBarChart.tsx        # daily/monthly bar chart
│       ├── HotHoursHeatmap.tsx      # 24-hour sales heatmap
│       ├── TopProductsPieChart.tsx  # pie chart
│       ├── ProfitLineChart.tsx      # revenue vs expenses line chart
│       └── SupplierBreakdownChart.tsx
│
└── pages/
    ├── auth/
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    │
    ├── dashboard/
    │   └── DashboardPage.tsx
    │
    ├── suppliers/
    │   ├── SuppliersPage.tsx         # list + create
    │   ├── SupplierDetailPage.tsx    # purchases, price history
    │   └── PurchaseForm.tsx          # box→kg auto calc + cup forecast display
    │
    ├── products/
    │   ├── ProductsPage.tsx          # list by cupType
    │   ├── ProductDetailPage.tsx
    │   ├── ProductForm.tsx
    │   └── RecipeBuilder.tsx         # BOM editor: ingredient rows + grams
    │
    ├── inventory/
    │   ├── InventoryPage.tsx         # list by category with low-stock alerts
    │   ├── InventoryItemDetail.tsx   # history chart
    │   ├── StockInForm.tsx
    │   ├── StockOutForm.tsx
    │   ├── WasteForm.tsx
    │   ├── CleaningForm.tsx          # raw kg → cleaned kg with loss preview
    │   └── InventoryValuation.tsx
    │
    ├── sales/
    │   ├── SalesPage.tsx             # POS terminal + sales history
    │   ├── POSTerminal.tsx           # product grid + cart + payment
    │   ├── MixedPaymentModal.tsx     # cash + card split input
    │   └── SaleReceiptModal.tsx      # receipt display after sale
    │
    ├── expenses/
    │   ├── ExpensesPage.tsx
    │   ├── ExpenseForm.tsx
    │   └── ExpenseBreakdown.tsx      # pie chart by type
    │
    ├── employees/
    │   ├── EmployeesPage.tsx
    │   ├── EmployeeDetailPage.tsx    # shifts, payments, fines
    │   ├── EmployeeForm.tsx
    │   ├── PayEmployeeForm.tsx
    │   ├── FineForm.tsx
    │   └── PayrollCalculator.tsx     # end-of-month calc: base+bonus−fines−advances
    │
    ├── cashbox/
    │   └── CashboxPage.tsx           # balance display + operations + history
    │
    ├── funds/
    │   ├── FundsPage.tsx             # 5 fund cards (Charity, Reserve, etc.)
    │   └── FundTransactionForm.tsx   # deposit / withdraw
    │
    ├── daily-report/
    │   ├── DailyReportPage.tsx       # list of reports
    │   ├── DailyReportForm.tsx       # full day entry form
    │   └── DailyReportDetail.tsx     # summary view with formula breakdown
    │
    ├── reports/
    │   ├── ReportsPage.tsx           # tabs: P&L / Cashflow / COGS / Monthly
    │   ├── ProfitReport.tsx
    │   ├── MonthlyReport.tsx
    │   ├── TopProductsReport.tsx
    │   ├── HotHoursReport.tsx
    │   ├── SupplierBreakdownReport.tsx
    │   ├── PayrollReport.tsx
    │   └── ExportButtons.tsx         # Excel + PDF download
    │
    └── business/
        ├── BusinessSetupPage.tsx     # first-time setup wizard
        └── BusinessProfilePage.tsx


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — ROUTING (React Router v6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All routes under /app are protected by ProtectedRoute.
All routes under /app are wrapped by AppShell (sidebar + header).

Routes:
  /login                        → LoginPage
  /register                     → RegisterPage
  /app                          → redirect to /app/dashboard
  /app/dashboard                → DashboardPage
  /app/business/setup           → BusinessSetupPage (if no business yet)
  /app/business/profile         → BusinessProfilePage
  /app/suppliers                → SuppliersPage
  /app/suppliers/:id            → SupplierDetailPage
  /app/products                 → ProductsPage
  /app/products/:id             → ProductDetailPage
  /app/inventory                → InventoryPage
  /app/inventory/:id            → InventoryItemDetail
  /app/sales                    → SalesPage (POS + history tabs)
  /app/expenses                 → ExpensesPage
  /app/employees                → EmployeesPage
  /app/employees/:id            → EmployeeDetailPage
  /app/cashbox                  → CashboxPage
  /app/funds                    → FundsPage
  /app/daily-report             → DailyReportPage
  /app/daily-report/new         → DailyReportForm
  /app/daily-report/:id         → DailyReportDetail
  /app/reports                  → ReportsPage (tabs)
  /app/reports/payroll/:month   → PayrollReport


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — API LAYER (implement EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── src/api/axios.ts ──────────────────────────────────────────────────
Create an Axios instance:
  baseURL: import.meta.env.VITE_API_BASE_URL
  timeout: 15000

REQUEST interceptor:
  - Read JWT from localStorage key 'chocoberry_token'
  - Add header: Authorization: Bearer {token}

RESPONSE interceptor:
  - On 401 → clear token → navigate('/login') → show toast
  - On 400 → extract error.response.data.error.message → show toast
  - On 500 → show generic error toast
  - Unwrap: return response.data.data (backend wraps in {success, data, message})

── src/api/auth.api.ts ────────────────────────────────────────────────
export const authApi = {
  register: (dto: RegisterDto) => POST /auth/register
  login:    (dto: LoginDto) => POST /auth/login
  me:       () => GET /auth/me
}

── src/api/suppliers.api.ts ──────────────────────────────────────────
export const suppliersApi = {
  list:         (params) => GET /suppliers
  create:       (dto) => POST /suppliers
  getById:      (id) => GET /suppliers/:id
  update:       (id, dto) => PATCH /suppliers/:id
  delete:       (id) => DELETE /suppliers/:id
  purchase:     (id, dto) => POST /suppliers/:id/purchase
  getPurchases: (id, params) => GET /suppliers/:id/purchases
  getPriceHistory: (id, params) => GET /suppliers/:id/price-history
  breakdown:    (params) => GET /suppliers/breakdown
}

── src/api/inventory.api.ts ──────────────────────────────────────────
export const inventoryApi = {
  list:        (params) => GET /inventory
  create:      (dto) => POST /inventory
  getById:     (id) => GET /inventory/:id
  update:      (id, dto) => PATCH /inventory/:id
  delete:      (id) => DELETE /inventory/:id
  stockIn:     (id, dto) => POST /inventory/:id/stock-in
  stockOut:    (id, dto) => POST /inventory/:id/stock-out
  adjust:      (id, dto) => POST /inventory/:id/adjust
  waste:       (id, dto) => POST /inventory/:id/waste
  cleaning:    (id, dto) => POST /inventory/:id/cleaning   ← CRITICAL
  getHistory:  (id, params) => GET /inventory/:id/history
  getLowStock: () => GET /inventory/alerts/low-stock
  valuation:   () => GET /inventory/valuation
}

── src/api/sales.api.ts ──────────────────────────────────────────────
export const salesApi = {
  list:        (params) => GET /sales
  create:      (dto) => POST /sales        ← atomic BOM deduction
  getById:     (id) => GET /sales/:id
  void:        (id) => PATCH /sales/:id/void
  statsToday:  () => GET /sales/stats/today
  topProducts: (params) => GET /sales/stats/top-products
  hotHours:    (params) => GET /sales/stats/hot-hours
}

── src/api/employees.api.ts ──────────────────────────────────────────
export const employeesApi = {
  list:              () => GET /employees
  create:            (dto) => POST /employees
  getById:           (id) => GET /employees/:id
  update:            (id, dto) => PATCH /employees/:id
  delete:            (id) => DELETE /employees/:id
  pay:               (id, dto) => POST /employees/:id/pay
  getPayments:       (id) => GET /employees/:id/payments
  createFine:        (id, dto) => POST /employees/:id/fine
  getFines:          (id) => GET /employees/:id/fines
  createShift:       (id, dto) => POST /employees/:id/shifts
  getPayroll:        (id, month) => GET /employees/:id/payroll/:month
  calculatePayroll:  (dto) => POST /employees/payroll/calculate-month
}

── src/api/daily-report.api.ts ───────────────────────────────────────
export const dailyReportApi = {
  list:     (params) => GET /daily-report
  create:   (dto) => POST /daily-report
  today:    () => GET /daily-report/today
  getById:  (id) => GET /daily-report/:id
  update:   (id, dto) => PATCH /daily-report/:id
  summary:  (id) => GET /daily-report/:id/summary
  finalize: (id) => POST /daily-report/:id/finalize
}

── src/api/reports.api.ts ────────────────────────────────────────────
export const reportsApi = {
  profit:             (params) => GET /reports/profit
  cashflow:           (params) => GET /reports/cashflow
  cogs:               (params) => GET /reports/cogs
  daily:              (params) => GET /reports/daily-summary
  monthly:            (params) => GET /reports/monthly
  topProducts:        (params) => GET /reports/top-products
  supplierBreakdown:  (params) => GET /reports/supplier-breakdown
  hotHours:           (params) => GET /reports/hot-hours
  payroll:            (month) => GET /reports/payroll/:month
  exportExcel:        (params) => GET /reports/export/excel  ← blob download
  exportPdf:          (params) => GET /reports/export/pdf    ← blob download
}

All API files use React Query keys:
  ['suppliers'], ['suppliers', id], ['suppliers', id, 'purchases'], etc.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — PAGE SPECIFICATIONS (implement ALL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── AUTH PAGES ────────────────────────────────────────────────────────

LoginPage:
  - Full-page centered card with Choco Berry logo + strawberry emoji
  - Fields: email (required, email format), password (required, min 6)
  - On success: store token in localStorage, redirect to /app/dashboard
  - Show error toast if credentials invalid
  - Link to RegisterPage

RegisterPage:
  - Fields: name, email, password, confirmPassword
  - Zod validation: passwords must match
  - On success: auto-login + redirect to /app/business/setup

── DASHBOARD PAGE ────────────────────────────────────────────────────

DashboardPage — fetch GET /business/dashboard AND GET /sales/stats/today

Layout:
  ROW 1 — 4 KPI StatsCards:
    • Total Sales Today (TJS) — with % vs yesterday
    • Cash Sales (TJS) 
    • Card Sales (TJS)
    • Number of Sales Today

  ROW 2 — 2 medium cards:
    • Inventory Low Stock Alerts: list items where stock < minStockLevel
      Each item: name + currentStock + minStockLevel + [Restock] button
    • Cashbox Balance: cash balance + card balance + total

  ROW 3 — 2 charts:
    • SalesBarChart: last 7 days revenue (bar)
    • TopProductsPieChart: top 5 products by qty this week

  ROW 4 — Quick Actions row:
    • [New Sale] → /app/sales
    • [Add Purchase] → /app/suppliers
    • [Daily Report] → /app/daily-report/new
    • [View Reports] → /app/reports

── SUPPLIERS PAGE ────────────────────────────────────────────────────

SuppliersPage:
  - Header: "Suppliers" + [+ Add Supplier] button
  - Filter bar: type (FRUIT/CHOCOLATE/PACKAGING/OTHER) + search by name
  - Table columns: Name, Type badge, Phone, Active status, Actions
  - Actions: View, Edit, Delete, [Buy] button
  - [Buy] opens PurchaseForm slide-over sheet

PurchaseForm (Sheet/Drawer):
  - Supplier name shown at top
  - Fields:
    • inventoryItemId (select from inventory items — filtered live)
    • Unit toggle: KG or BOX
    • If BOX selected: show boxCount + kgPerBox fields
      Auto-calculate: "Total: {boxCount × kgPerBox} kg" live preview
    • If KG: just quantity field
    • pricePerUnit (MoneyInput)
    • totalAmount: auto-calculated Decimal, displayed as read-only "= 6,000.00 см"
    • notes (optional textarea)
  - After submit: show forecast section:
    "Forecast: ~{forecastCupsBy03} cups (0.3ml) / ~{forecastCupsBy04} cups (0.4ml)"
    Display in a success card with color

SupplierDetailPage:
  - Header: supplier name + type badge + edit button
  - Tabs:
    [Purchases] — table with date, item, qty, unit, price, total + date range filter
    [Price History] — line chart of pricePerUnit over time per item
    [Statistics] — total spent this month, total this year

── PRODUCTS PAGE ─────────────────────────────────────────────────────

ProductsPage:
  - Filter tabs: ALL | CUP_300_ML | CUP_400_ML | CUP_80SM | CUP_90SM | CUP_ICE_CREAM | OTHER
  - Product cards grid (not table): each card shows
    • Product name (multilingual: show tg/ru based on language)
    • Cup type badge
    • Price: "35.00 см"
    • Cost: "auto-calculated" from recipe
    • Margin %: ((price-cost)/price × 100)
    • [Edit] [Recipe] [Delete] buttons

RecipeBuilder (Dialog):
  - Title: "Recipe / BOM for {product name}"
  - List of current ingredients: item name + quantity + unit + [remove]
  - [+ Add Ingredient] row: inventory item select + quantity + unit + [add]
  - Total estimated cost shown at bottom using avgCost
  - [Save Recipe] → POST /products/:id/recipe
  - On save: trigger cost recalculation display

── INVENTORY PAGE ────────────────────────────────────────────────────

InventoryPage:
  - Three section tabs: FRUITS | CHOCOLATE | PACKAGING
  - Top bar: [+ Add Item] + [Low Stock Alert badge showing count]
  - For each item, card layout showing:
    • Item name
    • Current stock: "120.00 kg" (unit-aware)
    • Min stock: low-stock indicator (red bar if below)
    • Avg cost per unit
    • Action buttons: [+In] [−Out] [Clean] [Waste] [History]

  Low Stock Alert section (if any): collapsible banner at top
    "3 items are running low!" — list with item names

StockIn/Out forms (Sheet): quantity + notes + date
WasteForm: quantity + reason dropdown + notes

CleaningForm (Sheet) — CRITICAL FEATURE:
  - Title: "Record Cleaning / Тозакунӣ"
  - Item name shown
  - rawQuantity field: "Raw weight (kg)"
  - Loss preview (read-only, live calculated):
    "Expected loss: {cleaningLossPct}% = {rawQty × lossPct / 100} kg"
    "Expected cleaned: {rawQty × (1 - lossPct/100)} kg"
  - actualCleanedQuantity field (optional override — shows "Override expected")
  - notes field
  - Result preview card:
    RAW: 120 kg → CLEANED: 100 kg → LOSS: 20 kg (16.7%)
  - [Confirm Cleaning] → POST /inventory/:id/cleaning
  - On success: show toast "Cleaned 100kg from 120kg raw (20kg lost)"

InventoryItemDetail:
  - Stat row: currentStock + avgCost + minStockLevel
  - History table: date, type badge, quantity, unitCost, stockBefore → stockAfter, reason
  - Line chart: stock level over time (30 days)

── SALES PAGE (POS) ──────────────────────────────────────────────────

SalesPage — Two tabs: [POS Terminal] [Sales History]

POSTerminal:
  LEFT PANEL — Product grid (2-3 columns):
    - Filter by cup type tabs at top
    - Each product card: name + price + image placeholder
    - Click to add to cart
    - Out-of-stock products shown grayed with tooltip "Insufficient inventory"

  RIGHT PANEL — Cart:
    - List of added items: name + qty stepper (+/−) + line total
    - [Remove] button per item
    - Subtotal, Discount input, Tax (read-only), TOTAL (bold)
    - Payment Method selector: CASH | CARD | MIXED
    - If MIXED selected → open MixedPaymentModal:
        cashAmount (MoneyInput) + cardAmount (MoneyInput)
        Live validation: "Cash + Card must equal {total}"
        Green check when amounts sum correctly
    - [Process Sale] button → POST /sales
    - On success: show SaleReceiptModal + clear cart

SaleReceiptModal:
  - Sale number, date, time
  - Items list with quantities and prices
  - Total + payment method breakdown
  - [Print] button (browser print dialog)
  - [New Sale] button to clear and start again

SalesHistory tab:
  - Date range filter + payment method filter + status filter
  - Table: sale# | date | items count | total | payment | status | actions
  - [Void] action: opens ConfirmDialog → PATCH /sales/:id/void

── EXPENSES PAGE ─────────────────────────────────────────────────────

ExpensesPage:
  - Filter: type (FIXED/VARIABLE/PAYROLL/OWNER_DRAW/CONSUMABLE/WASTE) + date range
  - [+ Add Expense] button
  - Table: date | description | vendor | type badge | amount | payment | actions
  - Total row at bottom

ExpenseForm:
  - expenseType select
  - categoryId select (filtered by expenseType)
  - amount MoneyInput
  - description
  - vendor
  - employeeId select (optional, for PAYROLL/CONSUMABLE types)
  - paymentMethod
  - date

ExpenseBreakdown (chart section below table):
  - Donut chart by expenseType for selected period
  - "Fixed: 2,500 см | Variable: 1,200 см | Payroll: 3,000 см ..."

── EMPLOYEES PAGE ────────────────────────────────────────────────────

EmployeesPage:
  - Owner badge on owners, "Consumable Buyer" badge for Намк/Баҳрулло
  - Table: name | role | salary | isOwner | isActive | actions
  - [+ Add Employee]

EmployeeDetailPage — 4 tabs:
  [Overview]:
    - Info card: name, role, hire date, salary, bonus %
    - This month stats: advances paid, fines total, expected salary

  [Payments]:
    - Table of all payments: date | type badge | amount | period | notes
    - [+ Pay] button → PayEmployeeForm

  [Fines]:
    - Table: date | reason | amount | applied? badge
    - [+ Fine] button → FineForm

  [Shifts]:
    - Table: start | end | hours | notes
    - [+ Log Shift] button

PayEmployeeForm:
  - paymentType: SALARY | ADVANCE | BONUS | LUNCH | FINE | OWNER_DRAW
  - amount MoneyInput
  - period (month picker for SALARY type, e.g. "2026-05")
  - notes

FineForm:
  - amount MoneyInput
  - reason (text, required)
  - date
  - Note: "Fine will be automatically deducted from next salary calculation"

PayrollCalculator (page section or modal):
  - Month picker
  - Table showing per employee:
    Name | Base | Bonus (monthSales × bonusPercent%) | Fines | Advances | FINAL
  - All amounts as MoneyDisplay components
  - [Calculate & Apply] → POST /employees/payroll/calculate-month
  - Confirmation dialog: "This will create salary payments for all employees. Confirm?"

── CASHBOX PAGE ──────────────────────────────────────────────────────

CashboxPage:
  - Two large balance cards:
    • CASH balance (green): "8,450.00 см"
    • CARD balance (blue): "3,200.00 см"
    • TOTAL (combined)
  - Action buttons: [Cash In] [Cash Out] [Open Session] [Close Session]
  - Today's Report section: breakdown of today's movements
  - History table: date | type badge | amount | balance before/after | description

── FUNDS PAGE ────────────────────────────────────────────────────────

FundsPage:
  - 5 fund cards in a grid:
    CHARITY "Фонди Хайр" | RESERVE "Фонди Захиравӣ" | RENOVATION "Фонди Ободонӣ"
    EMERGENCY "Рӯзи Мабодо" | TAX_RESERVE "Захираи Андоз"
  - Each card: fund name (i18n) + current balance + [Deposit] [Withdraw] buttons
  - FundTransactionForm: amount + type (INCOME/EXPENSE) + notes + date

── DAILY REPORT PAGE ─────────────────────────────────────────────────

DailyReportForm — MOST COMPLEX FORM:
  Section 1 — Sales (required):
    - Date picker
    - Total Sales (MoneyInput) — main TO
    - Sales breakdown by location (dynamic rows):
      [+ Add Location] → rows: label + amount
      Running total shown: "Sum of locations = {total}"
      Validation: sum of locations MUST equal totalSales

  Section 2 — Extra Income:
    - [+ Add Extra Income row]: label (e.g. "Трайфл") + amount
    - totalExtraIncome auto-sum displayed

  Section 3 — Expenses:
    - operationalExp (Масрафҳо): MoneyInput
    - consumables: per-employee rows (fetch employees where isConsumableBuyer=true)
      Employee select + amount → [+ Add Consumable]
    - ownerDraws: per-owner rows (fetch owners)
      Owner name displayed + amount input
    - supplierPurchases: dynamic rows
      Supplier select + amount
    - Notes textarea

  FORMULA DISPLAY (live, real-time):
    ┌─────────────────────────────────────────────┐
    │ Total Income = {totalSales + extraIncome}   │
    │ Total Expenses = {sum of all expenses}      │
    │ Charity = MAX(0, income − expenses − rem)   │
    │ Remaining Cash = {income − expenses − char} │
    └─────────────────────────────────────────────┘
    All values update live as user types.
    VALIDATION: if supplierPurchases total ≠ totalSales → red warning
    "⚠ Supplier amounts ({X}) do not equal total sales ({Y})"

  [Save Draft] [Finalize Report] buttons

DailyReportDetail:
  - Read-only view of finalized report
  - Same formula breakdown displayed
  - Share/print button

── REPORTS PAGE ──────────────────────────────────────────────────────

ReportsPage — Tabs:
  [P&L] [Cashflow] [COGS] [Monthly] [Top Products] [Hot Hours] [Suppliers] [Payroll]

P&L tab:
  - Date range picker
  - Summary cards: Revenue | COGS | Gross Profit | Expenses | Net Profit
  - ProfitLineChart: revenue vs expenses over time
  - Table: daily breakdown

Monthly tab:
  - Year + month picker
  - Full breakdown: all income categories + all expense categories
  - Export buttons: [Excel] [PDF]

Top Products tab:
  - Date range + limit (5/10/20)
  - Bar chart: product name vs quantity
  - Table: rank | product | qty sold | revenue | cost | margin%

Hot Hours tab:
  - Date range
  - 24-column heatmap: hour 0..23 × day of week
  - Color intensity = sales count
  - "Peak hour: 15:00–16:00"

Export buttons (visible on all report tabs):
  [📥 Export Excel] → GET /reports/export/excel?from=...&to=...&type=...
    → triggers file download
  [📄 Export PDF] → GET /reports/export/pdf?...
    → triggers file download
  Both use: response type = 'blob', create object URL, trigger anchor click


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — i18n IMPLEMENTATION (complete ALL three languages)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/i18n/index.ts:
  import i18n from 'i18next'
  import { initReactI18next } from 'react-i18next'
  import LanguageDetector from 'i18next-browser-languagedetector'
  // import all locale JSON files
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'tg',
      supportedLngs: ['tg', 'ru', 'en'],
      ns: ['common','dashboard','sales','inventory','suppliers',
           'products','expenses','employees','cashbox','funds',
           'daily-report','reports','business'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
    })

Header language switcher: 3-button toggle TG | RU | EN
  - Clicking changes i18n.changeLanguage + stores preference in localStorage

Every string in the app must use t('key') — NO hardcoded text.

Required translation keys for common.json (implement in all 3 languages):
  nav.dashboard, nav.sales, nav.inventory, nav.suppliers, nav.products,
  nav.expenses, nav.employees, nav.cashbox, nav.funds, nav.dailyReport,
  nav.reports, nav.business,
  actions.add, actions.edit, actions.delete, actions.save, actions.cancel,
  actions.confirm, actions.export, actions.print, actions.finalize,
  labels.total, labels.date, labels.amount, labels.quantity, labels.unit,
  labels.status, labels.notes, labels.search, labels.filter,
  status.completed, status.refunded, status.void, status.active,
  payment.cash, payment.card, payment.mixed,
  units.kg, units.gram, units.piece, units.pack, units.box, units.liter,
  currency.symbol (см), errors.required, errors.minLength,
  errors.invalidEmail, errors.passwordMismatch,
  toast.success, toast.error, toast.saved, toast.deleted

Example Tajik translations (use real Tajik text):
  nav.dashboard → "Асосӣ"
  nav.sales → "Фурӯш / Касса"
  nav.inventory → "Анбор"
  nav.suppliers → "Таъминкунандагон"
  nav.products → "Маҳсулот"
  nav.expenses → "Хароҷот"
  nav.employees → "Кормандон"
  nav.cashbox → "Касса"
  nav.funds → "Фондҳо"
  nav.dailyReport → "Ҳисоботи Рӯзона"
  nav.reports → "Гузоришот"
  actions.add → "Илова кардан"
  actions.edit → "Таҳрир кардан"
  actions.delete → "Нест кардан"
  actions.save → "Нигоҳ доштан"
  labels.total → "Ҷамъ"
  currency.symbol → "см"
  payment.cash → "Нақд"
  payment.card → "Карта"
  payment.mixed → "Омехта"

Russian (ru) translations use standard Russian business terminology.
English (en) translations use standard English.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — GLOBAL STATE (Zustand stores)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

auth.store.ts:
  interface AuthState {
    user: User | null
    token: string | null
    businessId: string | null
    isAuthenticated: boolean
    login: (token: string, user: User) => void
    logout: () => void
    setUser: (user: User) => void
  }
  Persist to localStorage with key 'chocoberry_auth'

theme.store.ts:
  interface ThemeState {
    mode: 'light' | 'dark'
    toggle: () => void
    setMode: (mode: 'light' | 'dark') => void
  }
  Persist to localStorage with key 'chocoberry_theme'
  On mount: apply class 'dark' to document.documentElement if dark mode

ui.store.ts:
  interface UIState {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — CRITICAL UTILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── src/utils/decimal.util.ts ─────────────────────────────────────────
import Decimal from 'decimal.js'

export const toDecimal = (value: string | number): Decimal =>
  new Decimal(value.toString())

export const formatMoney = (value: string | number | Decimal): string => {
  const d = new Decimal(value.toString())
  return d.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' см'
}

export const addMoney = (...values: (string | number | Decimal)[]): Decimal =>
  values.reduce((acc, v) => acc.plus(new Decimal(v.toString())), new Decimal(0))

export const multiplyMoney = (
  a: string | number | Decimal,
  b: string | number | Decimal
): Decimal => new Decimal(a.toString()).times(new Decimal(b.toString()))

export const subtractMoney = (a: string | number, b: string | number): Decimal =>
  new Decimal(a.toString()).minus(new Decimal(b.toString()))

// Daily report formula:
export const calcRemaining = (
  totalIncome: string,
  totalExpenses: string,
  charityAmount: string
): Decimal =>
  toDecimal(totalIncome).minus(toDecimal(totalExpenses)).minus(toDecimal(charityAmount))

export const calcCharity = (
  totalIncome: string,
  totalExpenses: string,
  targetRemaining: string
): Decimal => {
  const charity = toDecimal(totalIncome).minus(toDecimal(totalExpenses)).minus(toDecimal(targetRemaining))
  return Decimal.max(new Decimal(0), charity)
}

// IMPORTANT: Never use JavaScript's native + or * on money values!

── src/utils/validation.util.ts ──────────────────────────────────────
Zod schemas exactly matching backend DTOs:

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const supplierPurchaseSchema = z.object({
  inventoryItemId: z.string().uuid(),
  unit: z.enum(['KG','GRAM','LITER','ML','PIECE','BOX','PACK','BLOCK','DOZEN','TON']),
  quantity: z.string().optional(),
  boxCount: z.number().optional(),
  kgPerBox: z.string().optional(),
  pricePerUnit: z.string().min(1),
  notes: z.string().optional(),
}).refine(data => data.quantity || (data.boxCount && data.kgPerBox), {
  message: 'Provide either quantity or box count + kg per box',
})

export const cleaningSchema = z.object({
  rawQuantity: z.string().min(1),
  actualCleanedQuantity: z.string().optional(),
  notes: z.string().optional(),
})

export const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(0.01),
  })).min(1),
  paymentMethod: z.enum(['CASH','CARD','MIXED']),
  cashAmount: z.string().default('0'),
  cardAmount: z.string().default('0'),
  discount: z.string().default('0'),
}).refine(data => {
  if (data.paymentMethod === 'MIXED') {
    // validation happens in MixedPaymentModal with live total
    return true
  }
  return true
})

// Add all other schemas matching every backend DTO


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — LAYOUT & DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── Sidebar ────────────────────────────────────────────────────────────

Width: 240px expanded, 64px collapsed (icon only)
Logo area: strawberry icon (🍓) + "Choco Berry" text
Nav items (in order):
  🏠 Dashboard        → /app/dashboard
  🛒 POS / Sales      → /app/sales
  📦 Inventory        → /app/inventory  (+ red badge if low-stock count > 0)
  🚚 Suppliers        → /app/suppliers
  🍓 Products         → /app/products
  💸 Expenses         → /app/expenses
  👤 Employees        → /app/employees
  💰 Cashbox          → /app/cashbox
  🏦 Funds            → /app/funds
  📋 Daily Report     → /app/daily-report
  📊 Reports          → /app/reports
  ──────────────
  ⚙️  Business         → /app/business/profile
Bottom: user avatar + name + logout button

Active nav item: highlighted background (brand color)
Collapsed mode: tooltip showing name on hover

── Header ─────────────────────────────────────────────────────────────
Left: Hamburger toggle + Breadcrumb
Right:
  - Language switcher: pill buttons [TG] [RU] [EN]
  - Theme toggle: sun/moon icon
  - Notification bell (low stock count badge)
  - User avatar dropdown: Profile | Logout

── Color Palette ──────────────────────────────────────────────────────
Brand: Strawberry red #E8593C
Secondary: Chocolate brown #4A2810
Accent: Cream #FFF5E6

Light mode:
  background: #FAFAFA
  card: #FFFFFF
  border: #E5E7EB
  text-primary: #111827
  text-secondary: #6B7280

Dark mode (Tailwind class 'dark' on html):
  background: #0F0F0F
  card: #1A1A1A
  border: #2D2D2D
  text-primary: #F9FAFB
  text-secondary: #9CA3AF

shadcn/ui component customization in globals.css:
  --primary: brand red HSL
  --primary-foreground: white
  All dark mode variants defined

── Typography ─────────────────────────────────────────────────────────
Font: system-ui, -apple-system, sans-serif
Tajik text: ensure UTF-8 correct rendering
Money values: font-variant-numeric: tabular-nums (always right-aligned)

── Component Patterns ─────────────────────────────────────────────────

StatsCard:
  <Card>
    <CardContent>
      <div class="flex justify-between">
        <div>
          <p class="text-sm text-muted-foreground">{label}</p>
          <p class="text-2xl font-bold tabular-nums">{formatMoney(value)}</p>
          <p class="text-xs text-green-600">+{change}% vs yesterday</p>
        </div>
        <div class="rounded-full bg-brand/10 p-3">
          <Icon class="text-brand" />
        </div>
      </div>
    </CardContent>
  </Card>

DataTable (reusable):
  Props: columns[], data[], total, page, limit, onPageChange, onSort
  Features: sortable headers, pagination controls, loading skeleton
  Empty state: EmptyState component with relevant icon
  Always shows "Showing X–Y of Z results"

MoneyDisplay:
  Props: amount (string | Decimal), className?
  Always renders: formatMoney(amount) → right-aligned, tabular-nums
  Never use raw {amount} for money — always this component


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — REACT QUERY PATTERNS (use consistently everywhere)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In every page component:

// Query (READ):
const { data, isLoading, error } = useQuery({
  queryKey: ['inventory', { category, page, limit }],
  queryFn: () => inventoryApi.list({ category, page, limit }),
})

// Mutation (WRITE):
const createMutation = useMutation({
  mutationFn: inventoryApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
    toast.success(t('toast.saved'))
    onClose()
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Optimistic update on delete:
const deleteMutation = useMutation({
  mutationFn: inventoryApi.delete,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['inventory'] })
    const prev = queryClient.getQueryData(['inventory'])
    queryClient.setQueryData(['inventory'], (old) =>
      old.filter(item => item.id !== id))
    return { prev }
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['inventory'], context.prev)
    toast.error(err.message)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
  },
})

QueryClient config in main.tsx:
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,    // 30 seconds
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — CRITICAL BUSINESS LOGIC (implement EXACTLY in frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MONEY — NEVER USE JAVASCRIPT FLOAT:
   WRONG: const total = price * qty            // float precision error
   RIGHT: const total = multiplyMoney(price, qty).toString()

2. BOX → KG AUTO-CALCULATION (PurchaseForm):
   When user enters boxCount AND kgPerBox:
   const totalKg = multiplyMoney(boxCount, kgPerBox)
   Display: "4 boxes × 50 kg/box = 200.00 kg"
   Pass totalKg as quantity to API

   When user enters pricePerUnit:
   const totalAmount = multiplyMoney(totalKg, pricePerUnit)
   Display: "200 kg × 50.00 см = 10,000.00 см"
   All live, updating as user types.

3. CLEANING LOSS PREVIEW (CleaningForm):
   const expectedLoss = multiplyMoney(rawQty, item.cleaningLossPct).div(100)
   const expectedCleaned = subtractMoney(rawQty, expectedLoss)
   Show:
     RAW: {rawQty} kg
     LOSS: {expectedLoss} kg ({item.cleaningLossPct}%)
     CLEANED: {expectedCleaned} kg

4. MIXED PAYMENT VALIDATION (POSTerminal):
   const total = computed from cart items using Decimal.js
   const sum = addMoney(cashAmount, cardAmount)
   const isValid = sum.equals(total)
   Show green check if valid, red error if not
   [Process Sale] disabled until isValid === true

5. DAILY REPORT FORMULA (DailyReportForm):
   All values use Decimal.js, recalculate on every keystroke:

   const totalSalesFromLocations = addMoney(...locationAmounts)
   const locationsMatchTotal = totalSalesFromLocations.equals(totalSales)
   // show warning if not matching

   const totalExtraIncome = addMoney(...extraIncomeAmounts)
   const totalIncome = addMoney(totalSales, totalExtraIncome)

   const totalConsumables = addMoney(...consumableAmounts)
   const totalOwnerDraws = addMoney(...ownerDrawAmounts)
   const totalSupplierPurchases = addMoney(...supplierAmounts)
   const totalExpenses = addMoney(
     operationalExp,
     totalConsumables,
     totalOwnerDraws,
     totalSupplierPurchases
   )

   // Validation: suppliers must equal totalSales
   const suppliersMatchSales = totalSupplierPurchases.equals(totalSales)
   // if not: show red warning "⚠ Supplier total ≠ Total Sales"

   const remaining = subtractMoney(totalIncome, totalExpenses)
   const charity = Decimal.max(new Decimal(0), remaining)  // business logic

   Display all in real-time formula card:
   ┌─────────────────────────────────────────────┐
   │ 📈 Даромад  = {totalIncome}                 │
   │ 📉 Хароҷот = {totalExpenses}               │
   │ 🤲 Хайр    = {charityAmount}               │
   │ 💰 Боқӣ    = {remaining}                   │
   └─────────────────────────────────────────────┘
   Color: remaining > 0 → green, = 0 → yellow, < 0 → red

6. PAYROLL DISPLAY (PayrollCalculator):
   Per employee:
   const bonus = multiplyMoney(monthSales, employee.bonusPercent).div(100)
   const finesTotal = addMoney(...unappliedFines.map(f => f.amount))
   const advancesTotal = addMoney(...advances.map(a => a.amount))
   const finalSalary = addMoney(baseSalary, bonus)
                         .minus(finesTotal)
                         .minus(advancesTotal)
   Show breakdown table with each column


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — ERROR HANDLING & UX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loading states:
  - Skeleton cards on Dashboard KPIs while loading
  - Table skeleton (5 rows) while list data loads
  - Button shows spinner + "Saving..." while mutation is pending
  - Disable form submit button during mutation

Error states:
  - Empty state component when list returns 0 items
  - Error boundary wrapping each page
  - If API returns 409 (ConflictException from backend):
    Show toast: "Insufficient stock: {item name}"
  - If API returns 401: auto-redirect to login (handled in axios interceptor)
  - If API returns 400: show field-level errors in form
    (backend returns {error: {details: [{field, message}]}})
    Map backend validation errors to react-hook-form setError()

Toast notifications (react-hot-toast):
  - Success: green, bottom-right, 3 seconds
  - Error: red, bottom-right, 5 seconds
  - Warning: yellow, 4 seconds
  - Position: bottom-right on desktop, bottom-center on mobile

Confirmation dialogs:
  - Delete actions: "Are you sure? This cannot be undone." with red Confirm button
  - Sale void: "Void this sale? Inventory will NOT be restored."
  - Payroll calculation: "This will create salary payments. Confirm?"
  - Report finalize: "Finalize this daily report? It cannot be edited after."

Mobile responsiveness:
  - Sidebar collapses to bottom tab bar on screens < 768px
  - Tables become card lists on mobile
  - Charts maintain aspect ratio on small screens


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — BUSINESS SETUP WIZARD (first-time user)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BusinessSetupPage — multi-step wizard:
  Step 1 — Business Info:
    - name: "Choco Berry" (pre-filled)
    - type: FOOD (pre-selected)
    - address, phone (optional)
    - bonusPercent: 2.0 (pre-filled)

  Step 2 — Confirm Setup:
    - Summary: "We will automatically create:"
      • 3 default suppliers (Аки Талабшоҳ, Шоколадфурӯш, Намк, Баҳрулло)
      • 20+ inventory items (fruits, chocolate, packaging)
      • 5 real cup products with recipes
      • 5 employees (Ман, Дилшод, Саф, Намк, Баҳрулло)
      • 5 funds (Charity, Reserve, Renovation, Emergency, Tax)
      • All expense/income categories

    [Launch Choco Berry] → POST /business/setup

  Step 3 — Success:
    - "🎉 Choco Berry is ready!"
    - Show seeded counts: "20 inventory items, 5 products, 5 employees"
    - [Go to Dashboard] button


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 14 — GENERATION ORDER (follow EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.  package.json (all dependencies above)
2.  vite.config.ts (with path aliases)
3.  tsconfig.json (with path aliases)
4.  tailwind.config.ts (with dark mode: 'class', brand colors, shadcn)
5.  postcss.config.js
6.  src/index.css (Tailwind directives + CSS variables for brand)
7.  .env + .env.example
8.  shadcn components.json
9.  src/types/* (ALL type files — match backend models exactly)
10. src/utils/* (decimal.util, date.util, validation.util, export.util)
11. src/i18n/index.ts + ALL locale files (tg/ru/en, ALL namespaces)
12. src/store/* (auth, theme, ui stores)
13. src/api/axios.ts (with interceptors)
14. src/api/* (ALL api files — every endpoint)
15. src/hooks/* (ALL hooks)
16. src/components/layout/* (AppShell, Sidebar, Header, Guards)
17. src/components/ui/* (ALL shared components)
18. src/components/forms/*
19. src/components/charts/*
20. src/pages/auth/* (Login, Register)
21. src/pages/dashboard/DashboardPage.tsx
22. src/pages/business/*
23. src/pages/suppliers/*  (including PurchaseForm with box→kg logic)
24. src/pages/products/*   (including RecipeBuilder)
25. src/pages/inventory/*  (including CleaningForm with loss preview)
26. src/pages/sales/*      (POS terminal + MixedPaymentModal)
27. src/pages/expenses/*
28. src/pages/employees/*  (including PayrollCalculator)
29. src/pages/cashbox/*
30. src/pages/funds/*
31. src/pages/daily-report/* (DailyReportForm with live formula)
32. src/pages/reports/*    (all tabs + export)
33. src/App.tsx            (all routes wired)
34. src/main.tsx           (providers: Query, i18n, Router, Theme)
35. → npm run build        (MUST be 0 errors)
36. → verify all routes render without white screen
37. → smoke test:
      /login → works
      /register → works
      /app/business/setup → wizard works
      /app/dashboard → KPIs load
      /app/inventory → list loads, low-stock badge shows
      /app/sales → POS terminal, add product, process cash sale
      /app/suppliers → create purchase, see forecast
      /app/daily-report/new → formula updates live
      /app/reports → charts render, export buttons work

IF ANY STEP FAILS:
  - Read the TypeScript error exactly
  - Fix only that file
  - Re-run npm run build
  - DO NOT proceed until build is green


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 15 — FINAL CHECKLIST (verify before delivery)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ ] All 12 backend modules have corresponding frontend pages
  [ ] All backend API endpoints are consumed in api/*.ts files
  [ ] Every form validates with Zod schemas matching backend DTOs
  [ ] Money NEVER uses JS float — Decimal.js everywhere
  [ ] Cleaning form shows raw→cleaned live preview with loss %
  [ ] PurchaseForm shows box→kg auto-calc + cup forecast after submit
  [ ] POSTerminal: mixed payment validates cashAmount + cardAmount = total
  [ ] Daily report formula updates live and validates suppliers = sales
  [ ] Payroll calculator shows base + bonus − fines − advances = final
  [ ] i18n: every string uses t('key'), all 3 languages complete
  [ ] Dark mode: works on every page, no hardcoded colors
  [ ] Low-stock badge on sidebar inventory link
  [ ] Export buttons trigger file download for Excel/PDF
  [ ] JWT interceptor: auto-logout on 401
  [ ] React Query: invalidateQueries after every mutation
  [ ] Loading skeletons shown during data fetch
  [ ] Empty states shown when lists are empty
  [ ] Confirm dialogs for destructive actions
  [ ] Mobile responsive: sidebar collapses, tables adapt
  [ ] npm run build → 0 TypeScript errors
  [ ] No hardcoded TJS amounts, names, or strings anywhere