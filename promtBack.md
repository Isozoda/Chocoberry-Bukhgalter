╔══════════════════════════════════════════════════════════════════════════╗
║   CLAUDE CODE — CHOCO BERRY BACKEND v2.0                                 ║
║   Production-Ready · Zero Errors · Full Swagger · NestJS + PostgreSQL    ║
║   Real Business Logic · Complete BOM · Auto Inventory · P&L              ║
╚══════════════════════════════════════════════════════════════════════════╝

You are a SENIOR NestJS engineer building a 100% production-ready backend
for "CHOCO BERRY" — a real strawberry dessert business in Tajikistan.

⚠️ CRITICAL RULES (NON-NEGOTIABLE):
  ❌ NO TODOs, NO placeholders, NO "implement later" comments
  ❌ NO mock data, NO fake returns, NO stub methods
  ❌ NO compilation errors, NO TypeScript warnings
  ✅ Every endpoint MUST work end-to-end
  ✅ Every DTO MUST have @ApiProperty + class-validator
  ✅ Every money operation MUST use Decimal (never float)
  ✅ Every DB write MUST be inside Prisma.$transaction()
  ✅ npm run build MUST succeed with 0 errors before delivery
  ✅ npx prisma migrate dev MUST succeed without manual fixes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — REAL BUSINESS CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business name: CHOCO BERRY (strawberry & fruit dessert shop)
Currency: Tajik Somoni (TJS / сомонӣ / см)
Languages: Tajik (tg), Russian (ru), English (en)
Location: Dushanbe, Tajikistan
Owners: 3 partners (Раисҳо) — Ман, Дилшод, Саф

──────────────────────────────────────────────────────────────────
  HOW THE BUSINESS REALLY WORKS (MUST MODEL EXACTLY)
──────────────────────────────────────────────────────────────────

🟦 STEP 1 — RAW MATERIAL ARRIVAL FROM SUPPLIERS

  Three types of suppliers exist:

  (A) FRUIT SUPPLIER — "Аки Талабшоҳ"
      • Brings: Клубника, Банан, Ананас, Киви, Апелсин, Себ, ...
      • Units: KG (some), BOX (some — banana 4 boxes = ~200kg total)
      • Prices CHANGE EVERY DAY — must store price history per item per day
      • Example day: 120kg strawberry @ 50 TJS/kg = 6,000 TJS
      • System must AUTO-CALCULATE total cost when entering quantity + unit price
      • System must AUTO-FORECAST: "120kg strawberry → ~X cups (0.3ml) or Y cups (0.4ml)"

  (B) CHOCOLATE SUPPLIER — separate vendor
      • Brings: Chocolate (in tons or kg)
      • Example: 1 ton @ 250 TJS/kg = 250,000 TJS
      • Sorted by size: small / large
      • System must AUTO-FORECAST: "1 ton chocolate → ~X cups based on recipes"

  (C) CONSUMABLES BUYERS — staff: "Намк" and "Баҳрулло"
      • These are EMPLOYEES who buy supplies on behalf of the business
      • They take cash daily and bring back: cups, straws, napkins, etc.
      • Tracked as ConsumablePurchase (linked to employee)

🟧 STEP 2 — CLEANING (Тозакунӣ) — IMPORTANT NEW LOGIC

  Raw fruit must be cleaned before use:
    • 120kg raw strawberry → ~100kg cleaned (leaves, stems removed)
    • System tracks: rawWeight, cleanedWeight, lossPercentage
    • Loss is recorded as InventoryAdjustment with reason "CLEANING_LOSS"
    • Worker time spent cleaning is logged (optional shift entry)

  Each fruit has a default cleaning loss %:
    Клубника: ~15% loss
    Банан:    ~20% loss (peel)
    Ананас:   ~40% loss (skin + core)
    Киви:     ~15% loss (peel)
    Апелсин:  ~30% loss (peel)

🟦 STEP 3 — INVENTORY (Анбор) — THREE CATEGORIES

  (A) FRUITS (cleaned) — KG
      Клубника, Банан, Ананас, Киви, Апелсин, Себ
      + avgCost (weighted average), minStockLevel, alerts

  (B) CHOCOLATE & SAUCES — KG
      Шоколад (small/large sort tracked separately)

  (C) PACKAGING / RASKHODNIK — PIECE/PACK/BOX
      Cup types (5 sizes):
        • Стакан 0.3 ml (без крышки / no lid)
        • Стакан 0.4 ml (с крышкой / with lid)
        • Стакан 80 см (~100 ml)
        • Стакан 90 см (4-section / chor-joy)
        • Стакан мороженое (ice cream cup)

      Other consumables:
        • Салфетка влажная (block, ~20 pcs)
        • Салфетка сухая (pack, ~50 pcs)
        • Қошуқчаи мороженӣ (ice cream spoons)
        • Вилка для клубники (strawberry forks)
        • Целлофан мелкий (small wrap, pack)
        • Целлофан крупный (large wrap, pack)
        • Стикер, Крышка, Трубочка

🟪 STEP 4 — PRODUCT RECIPES (BOM — Bill of Materials)

  Every cup is built from: fruits + chocolate + 1 cup + utensils
  System MUST auto-deduct each ingredient on every sale.

  CUP 0.3 ml (total weight ~150g):
    Variant 1 — Pure Strawberry:
      • 100g strawberry + 50g chocolate + 1×cup-0.3 + 1×spoon + 1×napkin
      • Price: 35 TJS

    Variant 2 — Mixed:
      • 50g strawberry + 50g banana + 50g chocolate + 1×cup-0.3 + 1×spoon
      • Price: 30 TJS

  CUP 0.4 ml (total weight ~180g):
    Variant 1 — Pure Strawberry:
      • 120g strawberry + 60g chocolate + 1×cup-0.4 + 1×lid + 1×spoon
      • Price: 45 TJS

    Variant 2 — Double Mix (strawberry + banana):
      • 60g strawberry + 60g banana + 60g chocolate + 1×cup-0.4 + 1×lid
      • Price: 40 TJS

    Variant 3 — Triple Mix (strawberry + banana + ananas/kiwi):
      • 40g strawberry + 40g banana + 50g ananas-or-kiwi + 50g chocolate
      • Price: 50 TJS

  Other products: Trifle (Трайфл), Chocolate cocktail, Ice cream, Tea/Drinks

  ⚠️ Recipe is FLEXIBLE — admin can edit grams/prices via API
  ⚠️ When sale happens: deduct EXACT grams from inventory atomically

🟩 STEP 5 — SALES (POS / Касса)

  Worker selects product → payment method → receipt
  Payment methods: CASH (нақд), CARD (карта), MIXED (қисме нақд + карта)
  For MIXED: store both cashAmount + cardAmount separately
  System auto-deducts ingredients from inventory via recipe
  System creates FinancialTransaction (INCOME) in ledger

🟥 STEP 6 — EXPENSES (Хароҷот)

  (A) FIXED (monthly): Иҷора, Барқ, Об, Газ, Интернет, Андоз, Коммунал
  (B) VARIABLE: Расходники (Намк, Баҳрулло), Масрафҳо (misc daily)
  (C) PAYROLL: Маош, Аванс, Бонус, Хӯрок, Ҷарима
  (D) OWNER DRAWS: Ман(500), Дилшод(500), Саф(250) — daily cash withdrawal
  (E) WASTE / BRAK: spoiled fruit, expired items — write-off with reason
  (F) FUNDS: Charity, Reserve, Renovation, Emergency, Tax-reserve

🟨 STEP 7 — PAYROLL AUTOMATION (NEW — IMPORTANT)

  • Monthly salary calculated from: base + (bonus%) − (fines) − (advances)
  • BONUS auto-calculated: configurable % of monthly TO (e.g. 2% of total sales)
  • FINE auto-deducted: when admin creates Fine record, it reduces next payroll
  • ADVANCE auto-deducted: paid mid-month, deducted from end-month salary
  • End-of-month: API endpoint /payroll/calculate-month/:month

🟦 STEP 8 — DAILY REPORT (Ҳисоботи рӯзона) — CORE FEATURE

  Real example for 01.05.2026:

    ТО (total sales):            26,257 TJS
      Дом Печат:    20,785
      Ашан:          3,365
      Сиёма:         2,107

    Extra income:
      Трайфл:        1,300

    Operational:
      Масрафҳо:       455

    Consumables (per employee):
      Намк:          2,600
      Баҳрулло:        700

    Owner draws:
      Ман:             500
      Дилшод:          500
      Саф:             250

    Inventory purchases (today):
      Клубника:      5,700
      Шоколад:       5,800

    Charity Fund:        0  (only when income very high)
    Remaining cash:  8,450 TJS

  FORMULA:
    totalIncome  = totalSales + ΣextraIncome
    totalExp     = ΣsupplierPurchases + operational + Σconsumables + ΣownerDraws
    charity      = MAX(0, totalIncome − totalExp − remaining)
    remaining    = totalIncome − totalExp − charity
    VALIDATION   = ΣsupplierAmounts MUST equal totalSales

🟪 STEP 9 — REPORTS & ANALYTICS

  • Daily: today's full breakdown
  • Monthly: full P&L, payroll, taxes
  • Top products: best-sellers by qty + revenue
  • Hot hours: sales heatmap by hour-of-day
  • Supplier breakdown: who supplied how much per period
  • COGS: cost of goods sold (from inventory transactions)
  • Net profit: revenue − COGS − all expenses
  • Export: PDF + Excel for accountant


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Runtime:    Node.js 20 LTS (alpine)
  Framework:  NestJS 10+
  Database:   PostgreSQL 16
  ORM:        Prisma 5+ (with migrations)
  Auth:       JWT (Bearer) + bcrypt
  Validation: class-validator + class-transformer
  Money:      decimal.js (NEVER use number/float for currency)
  Docs:       Swagger / OpenAPI 3 at /api/docs
  Testing:    Jest (unit + e2e)
  Container:  Docker + docker-compose
  Logger:     NestJS built-in Logger

  INIT COMMANDS:
    npm i -g @nestjs/cli
    nest new chocoberry-api --package-manager npm --skip-git
    cd chocoberry-api
    npm install \
      @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger \
      @nestjs/throttler @nestjs/schedule \
      @prisma/client prisma passport passport-jwt passport-local \
      bcryptjs class-validator class-transformer decimal.js \
      uuid dayjs exceljs pdfkit
    npm install -D \
      @types/passport-jwt @types/passport-local @types/bcryptjs \
      @types/uuid @types/pdfkit
    npx prisma init

  .env (REQUIRED):
    NODE_ENV="development"
    PORT=3000
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chocoberry"
    JWT_SECRET="chocoberry_super_secret_change_in_prod_2026"
    JWT_EXPIRES_IN="7d"
    DEFAULT_CURRENCY="TJS"
    DEFAULT_LANGUAGE="tg"
    BONUS_PERCENT_DEFAULT="2.0"
    ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — COMPLETE PRISMA SCHEMA (write EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

// ─── ENUMS ────────────────────────────────────────────────────────────
enum Role             { OWNER STAFF ADMIN ACCOUNTANT }
enum BusinessType     { FOOD RETAIL SERVICE OTHER }
enum TransactionType  { INCOME EXPENSE }
enum ExpenseType      { FIXED VARIABLE PAYROLL OWNER_DRAW CONSUMABLE COGS WASTE FUND OTHER }
enum InventoryUnit    { KG GRAM LITER ML PIECE BOX PACK BLOCK DOZEN TON }
enum StockMovement    { IN OUT ADJUSTMENT WASTE CLEANING_LOSS TRANSFER }
enum PaymentMethod    { CASH CARD TRANSFER MIXED }
enum SaleStatus       { COMPLETED REFUNDED VOID }
enum SalaryType       { MONTHLY DAILY HOURLY }
enum PaymentType      { SALARY ADVANCE BONUS LUNCH FINE OWNER_DRAW OTHER }
enum CashboxOpType    { IN OUT OPEN CLOSE ADJUSTMENT }
enum SupplierType     { FRUIT CHOCOLATE PACKAGING OTHER }
enum FundType         { CHARITY RESERVE RENOVATION EMERGENCY TAX_RESERVE OTHER }
enum CupType          { CUP_300_ML CUP_400_ML CUP_80SM CUP_90SM CUP_ICE_CREAM OTHER }

// ─── USER & BUSINESS ──────────────────────────────────────────────────
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(STAFF)
  currency     String   @default("TJS")
  language     String   @default("tg")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  business     Business?
  employees    Employee[]
  dailyReports DailyReport[]
}

model Business {
  id        String       @id @default(uuid())
  userId    String       @unique
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  type      BusinessType @default(FOOD)
  address   String?
  phone     String?
  currency  String       @default("TJS")
  bonusPercent Decimal   @db.Decimal(5,2) @default(2.0)
  isActive  Boolean      @default(true)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  products       Product[]
  inventoryItems InventoryItem[]
  inventoryTxs   InventoryTransaction[]
  sales          Sale[]
  expenses       Expense[]
  transactions   FinancialTransaction[]
  employees      Employee[]
  cashbox        Cashbox?
  dailyReports   DailyReport[]
  categories     Category[]
  suppliers      Supplier[]
  supplierPurchases SupplierPurchase[]
  funds          Fund[]
  fundTxs        FundTransaction[]
  fines          Fine[]
}

// ─── SUPPLIERS (NEW — replaces hardcoded names) ───────────────────────
model Supplier {
  id         String       @id @default(uuid())
  businessId String
  business   Business     @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name       String
  type       SupplierType @default(FRUIT)
  phone      String?
  notes      String?
  isActive   Boolean      @default(true)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  purchases  SupplierPurchase[]
  prices     SupplierPriceHistory[]

  @@unique([businessId, name])
  @@index([businessId, type])
}

// Price history per supplier per item per day (NEW)
model SupplierPriceHistory {
  id              String        @id @default(uuid())
  supplierId      String
  supplier        Supplier      @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  date            DateTime      @db.Date
  pricePerUnit    Decimal       @db.Decimal(12,4)

  @@unique([supplierId, inventoryItemId, date])
  @@index([inventoryItemId, date])
}

// Each purchase from supplier (replaces hardcoded "Дом Печат" string)
model SupplierPurchase {
  id              String        @id @default(uuid())
  businessId      String
  business        Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  supplierId      String
  supplier        Supplier      @relation(fields: [supplierId], references: [id])
  inventoryItemId String?
  inventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
  quantity        Decimal       @db.Decimal(12,4)
  unit            InventoryUnit
  pricePerUnit    Decimal       @db.Decimal(12,4)
  totalAmount     Decimal       @db.Decimal(12,2)
  // For box-based units: how many KG per box (auto-converted)
  boxCount        Int?
  kgPerBox        Decimal?      @db.Decimal(8,2)
  // Forecast: how many cups can be produced
  forecastCupsBy03 Int?
  forecastCupsBy04 Int?
  notes           String?
  date            DateTime      @default(now())
  createdAt       DateTime      @default(now())

  inventoryTxId   String?       @unique
  inventoryTx     InventoryTransaction? @relation(fields: [inventoryTxId], references: [id])

  @@index([businessId, date])
  @@index([supplierId, date])
}

// ─── CATEGORIES ───────────────────────────────────────────────────────
model Category {
  id          String          @id @default(uuid())
  businessId  String
  business    Business        @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name        String
  nameRu      String?
  nameTg      String?
  type        TransactionType
  expenseType ExpenseType?
  icon        String?
  color       String?
  isDefault   Boolean         @default(false)

  expenses    Expense[]

  @@unique([businessId, name])
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────
model Product {
  id         String   @id @default(uuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name       String
  nameRu     String?
  nameTg     String?
  cupType    CupType? // 0.3ml, 0.4ml, etc — null for non-cup items
  variant    String?  // "PURE", "DOUBLE_MIX", "TRIPLE_MIX"
  price      Decimal  @db.Decimal(10,2)
  cost       Decimal  @db.Decimal(10,2) @default(0)  // auto from recipe
  unit       String   @default("piece")
  category   String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  saleItems SaleItem[]
  recipe    ProductRecipe[]

  @@unique([businessId, name])
  @@index([businessId, cupType])
}

// Each ingredient in a product (BOM)
model ProductRecipe {
  id              String        @id @default(uuid())
  productId       String
  product         Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  quantity        Decimal       @db.Decimal(10,4)
  unit            InventoryUnit
  notes           String?

  @@unique([productId, inventoryItemId])
}

// ─── INVENTORY ────────────────────────────────────────────────────────
model InventoryItem {
  id              String        @id @default(uuid())
  businessId      String
  business        Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name            String
  nameRu          String?
  nameTg          String?
  unit            InventoryUnit @default(PIECE)
  currentStock    Decimal       @db.Decimal(14,4) @default(0)
  minStockLevel   Decimal       @db.Decimal(14,4) @default(0)
  avgCost         Decimal       @db.Decimal(14,4) @default(0)
  category        String?       // FRUIT, CHOCOLATE, PACKAGING
  // Cleaning loss percentage (NEW) — 15 means 15% lost when cleaned
  cleaningLossPct Decimal       @db.Decimal(5,2) @default(0)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  transactions InventoryTransaction[]
  recipes      ProductRecipe[]
  purchases    SupplierPurchase[]
  priceHistory SupplierPriceHistory[]

  @@unique([businessId, name])
  @@index([businessId, category])
}

model InventoryTransaction {
  id              String        @id @default(uuid())
  businessId      String
  business        Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  type            StockMovement
  quantity        Decimal       @db.Decimal(14,4)
  unitCost        Decimal       @db.Decimal(14,4)
  totalCost       Decimal       @db.Decimal(14,4)
  stockBefore     Decimal       @db.Decimal(14,4)
  stockAfter      Decimal       @db.Decimal(14,4)
  reason          String?       // CLEANING_LOSS, EXPIRED, DAMAGED, SALE, PURCHASE
  notes           String?
  expenseId       String?       @unique
  expense         Expense?      @relation(fields: [expenseId], references: [id])
  saleId          String?
  date            DateTime      @default(now())
  createdAt       DateTime      @default(now())

  supplierPurchase SupplierPurchase?

  @@index([businessId, date])
  @@index([inventoryItemId, date])
  @@index([businessId, type])
}

// ─── SALES (POS) ──────────────────────────────────────────────────────
model Sale {
  id            String        @id @default(uuid())
  businessId    String
  business      Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  saleNumber    String
  items         SaleItem[]
  subtotal      Decimal       @db.Decimal(12,2)
  discount      Decimal       @db.Decimal(12,2) @default(0)
  tax           Decimal       @db.Decimal(12,2) @default(0)
  total         Decimal       @db.Decimal(12,2)
  paymentMethod PaymentMethod @default(CASH)
  cashAmount    Decimal       @db.Decimal(12,2) @default(0)  // for MIXED
  cardAmount    Decimal       @db.Decimal(12,2) @default(0)  // for MIXED
  status        SaleStatus    @default(COMPLETED)
  employeeId    String?
  notes         String?
  date          DateTime      @default(now())
  createdAt     DateTime      @default(now())

  @@index([businessId, date])
  @@index([businessId, status])
}

model SaleItem {
  id        String   @id @default(uuid())
  saleId    String
  sale      Sale     @relation(fields: [saleId], references: [id], onDelete: Cascade)
  productId String?
  product   Product? @relation(fields: [productId], references: [id])
  name      String
  quantity  Decimal  @db.Decimal(10,2)
  unitPrice Decimal  @db.Decimal(10,2)
  cost      Decimal  @db.Decimal(10,2) @default(0)
  total     Decimal  @db.Decimal(12,2)
}

// ─── EXPENSES ─────────────────────────────────────────────────────────
model Expense {
  id            String        @id @default(uuid())
  businessId    String
  business      Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  categoryId    String?
  category      Category?     @relation(fields: [categoryId], references: [id])
  expenseType   ExpenseType   @default(VARIABLE)
  amount        Decimal       @db.Decimal(12,2)
  description   String?
  vendor        String?
  employeeId    String?
  employee      Employee?     @relation(fields: [employeeId], references: [id])
  paymentMethod PaymentMethod @default(CASH)
  isPaid        Boolean       @default(true)
  date          DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  inventoryTx   InventoryTransaction?
  employeePay   EmployeePayment?
}

// ─── FINANCIAL LEDGER ─────────────────────────────────────────────────
model FinancialTransaction {
  id          String          @id @default(uuid())
  businessId  String
  business    Business        @relation(fields: [businessId], references: [id], onDelete: Cascade)
  type        TransactionType
  amount      Decimal         @db.Decimal(12,2)
  description String?
  referenceId String?
  refType     String?
  date        DateTime        @default(now())
  createdAt   DateTime        @default(now())

  @@index([businessId, date])
  @@index([businessId, type])
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────
model Employee {
  id           String     @id @default(uuid())
  businessId   String
  business     Business   @relation(fields: [businessId], references: [id], onDelete: Cascade)
  userId       String?
  user         User?      @relation(fields: [userId], references: [id])
  name         String
  role         String
  isOwner      Boolean    @default(false)
  isConsumableBuyer Boolean @default(false) // Намк, Баҳрулло
  phone        String?
  salary       Decimal    @db.Decimal(10,2) @default(0)
  salaryType   SalaryType @default(MONTHLY)
  bonusPercent Decimal    @db.Decimal(5,2) @default(0)
  hireDate     DateTime   @default(now())
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  payments EmployeePayment[]
  expenses Expense[]
  shifts   Shift[]
  fines    Fine[]
}

model EmployeePayment {
  id          String      @id @default(uuid())
  employeeId  String
  employee    Employee    @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  expenseId   String?     @unique
  expense     Expense?    @relation(fields: [expenseId], references: [id])
  amount      Decimal     @db.Decimal(10,2)
  paymentType PaymentType @default(SALARY)
  period      String?     // "2026-05"
  notes       String?
  paidAt      DateTime    @default(now())
}

model Shift {
  id          String    @id @default(uuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  startTime   DateTime
  endTime     DateTime?
  hoursWorked Decimal?  @db.Decimal(5,2)
  notes       String?
}

// Fines (NEW) — auto-deducted from next salary
model Fine {
  id         String    @id @default(uuid())
  businessId String
  business   Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  employeeId String
  employee   Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  amount     Decimal   @db.Decimal(10,2)
  reason     String
  isApplied  Boolean   @default(false)
  appliedAt  DateTime?
  date       DateTime  @default(now())
  createdAt  DateTime  @default(now())

  @@index([employeeId, isApplied])
}

// ─── CASHBOX ──────────────────────────────────────────────────────────
model Cashbox {
  id          String   @id @default(uuid())
  businessId  String   @unique
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  balance     Decimal  @db.Decimal(12,2) @default(0)
  cardBalance Decimal  @db.Decimal(12,2) @default(0)  // separate card tracking
  currency    String   @default("TJS")
  lastUpdated DateTime @default(now())

  operations CashboxOperation[]
}

model CashboxOperation {
  id            String        @id @default(uuid())
  cashboxId     String
  cashbox       Cashbox       @relation(fields: [cashboxId], references: [id], onDelete: Cascade)
  type          CashboxOpType
  amount        Decimal       @db.Decimal(12,2)
  balanceBefore Decimal       @db.Decimal(12,2)
  balanceAfter  Decimal       @db.Decimal(12,2)
  description   String?
  referenceId   String?
  createdAt     DateTime      @default(now())
}

// ─── FUNDS (NEW) — Charity, Reserve, Renovation, Emergency, Tax ──────
model Fund {
  id         String   @id @default(uuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  type       FundType
  name       String
  balance    Decimal  @db.Decimal(12,2) @default(0)
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  transactions FundTransaction[]

  @@unique([businessId, type])
}

model FundTransaction {
  id         String          @id @default(uuid())
  businessId String
  business   Business        @relation(fields: [businessId], references: [id], onDelete: Cascade)
  fundId     String
  fund       Fund            @relation(fields: [fundId], references: [id], onDelete: Cascade)
  type       TransactionType
  amount     Decimal         @db.Decimal(12,2)
  notes      String?
  date       DateTime        @default(now())
  createdAt  DateTime        @default(now())

  @@index([fundId, date])
}

// ─── DAILY REPORT (CORE) ──────────────────────────────────────────────
model DailyReport {
  id              String   @id @default(uuid())
  businessId      String
  business        Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  date            DateTime @db.Date

  totalSales      Decimal  @db.Decimal(12,2) @default(0)
  cashSales       Decimal  @db.Decimal(12,2) @default(0)
  cardSales       Decimal  @db.Decimal(12,2) @default(0)
  extraIncome     Decimal  @db.Decimal(12,2) @default(0)
  totalIncome     Decimal  @db.Decimal(12,2) @default(0)

  suppliersTotal  Decimal  @db.Decimal(12,2) @default(0)
  operationalExp  Decimal  @db.Decimal(12,2) @default(0)
  consumablesExp  Decimal  @db.Decimal(12,2) @default(0)
  ownerDraws      Decimal  @db.Decimal(12,2) @default(0)
  inventoryExp    Decimal  @db.Decimal(12,2) @default(0)
  totalExpenses   Decimal  @db.Decimal(12,2) @default(0)

  charityAmount   Decimal  @db.Decimal(12,2) @default(0)
  remaining       Decimal  @db.Decimal(12,2) @default(0)

  notes           String?
  isFinalized     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  lines     DailyReportLine[]
  suppliers DailySupplierLine[]
  draws     DailyOwnerDraw[]

  @@unique([businessId, date])
  @@index([businessId, date])
}

model DailyReportLine {
  id         String      @id @default(uuid())
  reportId   String
  report     DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  label      String
  amount     Decimal     @db.Decimal(12,2)
  type       String  // INCOME | EXPENSE | INVENTORY | DRAW
  subType    String?
  employeeId String?
  note       String?
}

model DailySupplierLine {
  id         String      @id @default(uuid())
  reportId   String
  report     DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  supplierId String?
  name       String
  amount     Decimal     @db.Decimal(12,2)
}

model DailyOwnerDraw {
  id         String      @id @default(uuid())
  reportId   String
  report     DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  employeeId String?
  ownerName  String
  amount     Decimal     @db.Decimal(12,2)
  note       String?
}
```

After schema → run:
  npx prisma migrate dev --name init
  npx prisma generate


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — COMPLETE FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/
├── main.ts                           # Bootstrap + Swagger + CORS + global pipes
├── app.module.ts                     # Root module imports all
├── prisma/
│   └── prisma.service.ts             # PrismaClient lifecycle + transaction helper
├── config/
│   └── configuration.ts              # Typed config from env
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts # @CurrentUser() param decorator
│   │   ├── public.decorator.ts       # @Public() to skip JWT
│   │   └── roles.decorator.ts        # @Roles(Role.OWNER)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # Global guard, respects @Public()
│   │   └── roles.guard.ts            # Checks @Roles()
│   ├── filters/
│   │   └── http-exception.filter.ts  # Wraps errors in standard format
│   ├── interceptors/
│   │   └── transform.interceptor.ts  # Wraps success responses
│   ├── utils/
│   │   ├── decimal.util.ts           # toDecimal, addDecimal, multDecimal
│   │   └── date.util.ts              # startOfDay, endOfDay, formatDate
│   └── dto/
│       ├── pagination.dto.ts         # page, limit + transforms
│       └── date-range.dto.ts         # from, to dates
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts        # /register /login /me
    │   ├── auth.service.ts
    │   ├── jwt.strategy.ts
    │   └── dto/
    │       ├── register.dto.ts
    │       ├── login.dto.ts
    │       └── auth-response.dto.ts
    ├── business/
    │   ├── business.module.ts
    │   ├── business.controller.ts
    │   ├── business.service.ts       # setupDefaults() seeds everything
    │   └── dto/
    │       ├── create-business.dto.ts
    │       ├── update-business.dto.ts
    │       └── dashboard.dto.ts
    ├── suppliers/                    # NEW MODULE
    │   ├── suppliers.module.ts
    │   ├── suppliers.controller.ts
    │   ├── suppliers.service.ts
    │   └── dto/
    │       ├── create-supplier.dto.ts
    │       ├── create-purchase.dto.ts # box→kg auto, forecast cups
    │       └── filter-purchases.dto.ts
    ├── products/
    │   ├── products.module.ts
    │   ├── products.controller.ts
    │   ├── products.service.ts       # auto-recalc cost from recipe
    │   └── dto/
    │       ├── create-product.dto.ts
    │       ├── update-product.dto.ts
    │       └── set-recipe.dto.ts
    ├── inventory/
    │   ├── inventory.module.ts
    │   ├── inventory.controller.ts
    │   ├── inventory.service.ts      # avgCost engine, cleaning, waste
    │   └── dto/
    │       ├── create-item.dto.ts
    │       ├── stock-in.dto.ts
    │       ├── stock-out.dto.ts
    │       ├── adjust.dto.ts
    │       ├── waste.dto.ts
    │       └── cleaning.dto.ts       # NEW: raw → cleaned with loss
    ├── sales/
    │   ├── sales.module.ts
    │   ├── sales.controller.ts
    │   ├── sales.service.ts          # atomic, auto BOM deduction
    │   └── dto/
    │       ├── create-sale.dto.ts
    │       ├── sale-item.dto.ts
    │       ├── mixed-payment.dto.ts  # cash + card amounts
    │       └── filter-sales.dto.ts
    ├── expenses/
    │   ├── expenses.module.ts
    │   ├── expenses.controller.ts
    │   ├── expenses.service.ts
    │   └── dto/
    │       ├── create-expense.dto.ts
    │       └── filter-expenses.dto.ts
    ├── employees/
    │   ├── employees.module.ts
    │   ├── employees.controller.ts
    │   ├── employees.service.ts      # payroll calc, fines, bonuses
    │   └── dto/
    │       ├── create-employee.dto.ts
    │       ├── pay-employee.dto.ts
    │       ├── create-fine.dto.ts    # NEW
    │       ├── calc-payroll.dto.ts   # NEW: end-of-month calc
    │       └── create-shift.dto.ts
    ├── cashbox/
    │   ├── cashbox.module.ts
    │   ├── cashbox.controller.ts
    │   ├── cashbox.service.ts        # cash + card separately
    │   └── dto/
    │       └── cashbox-op.dto.ts
    ├── funds/                        # NEW MODULE
    │   ├── funds.module.ts
    │   ├── funds.controller.ts
    │   ├── funds.service.ts          # charity, reserve, renovation
    │   └── dto/
    │       ├── create-fund.dto.ts
    │       └── fund-op.dto.ts
    ├── daily-report/
    │   ├── daily-report.module.ts
    │   ├── daily-report.controller.ts
    │   ├── daily-report.service.ts   # CORE
    │   └── dto/
    │       ├── create-daily-report.dto.ts
    │       └── filter-report.dto.ts
    └── reports/
        ├── reports.module.ts
        ├── reports.controller.ts
        ├── reports.service.ts        # P&L, COGS, analytics, export
        └── dto/
            └── report-filter.dto.ts


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — ALL API ENDPOINTS (prefix /api/v1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── AUTH ──────────────────────────────────────────────
POST   /auth/register
POST   /auth/login
GET    /auth/me

── BUSINESS ──────────────────────────────────────────
POST   /business/setup              # Auto-seed all defaults (NEW: + suppliers + funds)
GET    /business/profile
PATCH  /business/profile
GET    /business/dashboard          # Today summary widget

── SUPPLIERS (NEW) ───────────────────────────────────
GET    /suppliers
POST   /suppliers
GET    /suppliers/:id
PATCH  /suppliers/:id
DELETE /suppliers/:id
POST   /suppliers/:id/purchase      # Buy from supplier (box→kg auto + forecast)
GET    /suppliers/:id/purchases     ?from&to
GET    /suppliers/:id/price-history ?itemId&from&to
GET    /suppliers/breakdown         ?from&to  # by supplier total

── PRODUCTS ──────────────────────────────────────────
GET    /products                    ?cupType
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
POST   /products/:id/recipe         # Set BOM
GET    /products/:id/recipe
GET    /products/:id/margin         # Auto from recipe + avgCost

── INVENTORY ─────────────────────────────────────────
GET    /inventory                   ?category
POST   /inventory
GET    /inventory/:id
PATCH  /inventory/:id
DELETE /inventory/:id
POST   /inventory/:id/stock-in      # Manual or via supplier purchase
POST   /inventory/:id/stock-out
POST   /inventory/:id/adjust
POST   /inventory/:id/waste         # Brak with reason
POST   /inventory/:id/cleaning      # NEW: raw 120kg → cleaned 100kg
GET    /inventory/:id/history
GET    /inventory/alerts/low-stock
GET    /inventory/valuation

── SALES (POS) ───────────────────────────────────────
GET    /sales                       ?from&to&status&payment
POST   /sales                       # Auto deduct BOM, supports MIXED payment
GET    /sales/:id
PATCH  /sales/:id/void
GET    /sales/stats/today
GET    /sales/stats/top-products    ?from&to&limit
GET    /sales/stats/hot-hours       ?from&to  # Hourly heatmap

── EXPENSES ──────────────────────────────────────────
GET    /expenses                    ?type&from&to
POST   /expenses
GET    /expenses/:id
PATCH  /expenses/:id
DELETE /expenses/:id
GET    /expenses/breakdown          ?from&to

── EMPLOYEES ─────────────────────────────────────────
GET    /employees
POST   /employees
GET    /employees/:id
PATCH  /employees/:id
DELETE /employees/:id
POST   /employees/:id/pay
GET    /employees/:id/payments
POST   /employees/:id/fine          # NEW
GET    /employees/:id/fines
POST   /employees/:id/shifts
GET    /employees/:id/payroll/:month  # NEW: calculated salary
POST   /employees/payroll/calculate-month  # NEW: bulk monthly calc

── CASHBOX ───────────────────────────────────────────
GET    /cashbox
POST   /cashbox/in
POST   /cashbox/out
POST   /cashbox/open
POST   /cashbox/close
GET    /cashbox/history
GET    /cashbox/report/today

── FUNDS (NEW) ───────────────────────────────────────
GET    /funds
POST   /funds
GET    /funds/:id
POST   /funds/:id/deposit
POST   /funds/:id/withdraw
GET    /funds/:id/transactions

── DAILY REPORT ──────────────────────────────────────
POST   /daily-report
GET    /daily-report                ?from&to
GET    /daily-report/today
GET    /daily-report/:id
PATCH  /daily-report/:id
GET    /daily-report/:id/summary
POST   /daily-report/:id/finalize

── REPORTS (P&L & ANALYTICS) ─────────────────────────
GET    /reports/profit              ?from&to
GET    /reports/cashflow            ?from&to
GET    /reports/cogs                ?from&to
GET    /reports/daily-summary       ?date
GET    /reports/monthly             ?year&month
GET    /reports/top-products        ?from&to
GET    /reports/supplier-breakdown  ?from&to
GET    /reports/hot-hours           ?from&to        # NEW
GET    /reports/payroll/:month                       # NEW
GET    /reports/export/excel        ?from&to&type   # NEW
GET    /reports/export/pdf          ?from&to&type   # NEW


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — CORE SERVICE LOGIC (implement EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── 6.1 SUPPLIER PURCHASE (box → kg auto + forecast) ──────────────────

POST /suppliers/:id/purchase  body:
{
  "inventoryItemId": "uuid",
  "boxCount": 4,                     // optional
  "kgPerBox": 50,                    // if boxCount → quantity = boxCount × kgPerBox
  "quantity": 200,                   // OR direct kg
  "unit": "KG",
  "pricePerUnit": 50,
  "notes": "Аки Талабшоҳ — 4 коробка"
}

Logic:
  1. If boxCount && kgPerBox → quantity = boxCount × kgPerBox
  2. totalAmount = quantity × pricePerUnit (Decimal!)
  3. Save to SupplierPriceHistory (today's price for this item)
  4. Forecast cups (NEW):
       - find recipes that use this item
       - for each cup type (CUP_300_ML, CUP_400_ML):
           cupsPossible = floor(quantity / qtyPerCup)
       - store forecastCupsBy03, forecastCupsBy04
  5. Create InventoryTransaction (IN) with avgCost recalc
  6. Update inventory.currentStock += quantity
  7. Create Expense (COGS or VARIABLE)
  8. Create FinancialTransaction (EXPENSE)
  9. Update Cashbox (-totalAmount)
  10. Return purchase + forecast info

── 6.2 INVENTORY CLEANING (NEW) ──────────────────────────────────────

POST /inventory/:id/cleaning  body:
{
  "rawQuantity": 120,
  "actualCleanedQuantity": 100,  // optional, default = raw × (1 - lossPct/100)
  "notes": "Strawberry cleaning"
}

Logic:
  1. Validate rawQuantity ≤ currentStock
  2. cleanedQuantity = actualCleanedQuantity ?? raw × (1 - cleaningLossPct/100)
  3. lossQuantity = rawQuantity - cleanedQuantity
  4. Create 2 InventoryTransaction:
       - OUT (rawQuantity) reason="CLEANING_RAW"
       - IN (cleanedQuantity) reason="CLEANING_CLEANED"
       - Difference logged as CLEANING_LOSS adjustment
  5. avgCost preserved through cleaning (cost transfers per kg)
  6. Return: {raw, cleaned, loss, lossPct}

── 6.3 SALE WITH AUTO BOM DEDUCTION ──────────────────────────────────

POST /sales  body:
{
  "items": [
    { "productId": "uuid-cup-0.3-pure", "quantity": 2 },
    { "productId": "uuid-cup-0.4-mix", "quantity": 1 }
  ],
  "paymentMethod": "MIXED",
  "cashAmount": 70,
  "cardAmount": 30,
  "discount": 0
}

Logic (ATOMIC in $transaction):
  1. For each item:
       a. Load product + recipe
       b. For each recipe ingredient:
          - check inventory.currentStock >= recipe.quantity × item.quantity
          - if not → throw ConflictException("Не хватает: ${item.name}")
       c. Calculate item.cost = Σ(recipe.qty × inventory.avgCost)
  2. subtotal = Σ(item.qty × item.unitPrice)
  3. total = subtotal - discount + tax
  4. If MIXED: validate cashAmount + cardAmount = total
  5. Create Sale + SaleItems
  6. For each ingredient → InventoryTransaction (OUT) + decrement stock
  7. Create FinancialTransaction (INCOME)
  8. Update Cashbox: balance += cashAmount, cardBalance += cardAmount
  9. Return full sale + receipt data

── 6.4 PAYROLL CALCULATION (NEW — end of month) ──────────────────────

POST /employees/payroll/calculate-month  body:
{
  "month": "2026-05",
  "applyImmediately": true
}

Logic per employee:
  1. baseSalary = employee.salary
  2. monthSales = sum of all sales in this month (for the business)
  3. bonus = monthSales × employee.bonusPercent / 100
  4. unappliedFines = sum(Fine where employeeId = X and isApplied = false)
  5. paidAdvances = sum(EmployeePayment where type=ADVANCE, period=month)
  6. finalSalary = baseSalary + bonus - unappliedFines - paidAdvances

  If applyImmediately:
     - Create EmployeePayment (SALARY) for finalSalary
     - Create Expense (PAYROLL)
     - Mark all fines as applied
     - Update Cashbox

  Return: {employees: [{name, base, bonus, fines, advances, final}]}

── 6.5 BUSINESS SETUP — auto-seed (UPDATED) ──────────────────────────

POST /business/setup  body: { name: "Choco Berry", type: "FOOD" }

Creates in ONE $transaction:

  CATEGORIES (income):
    Стакан 0.3, Стакан 0.4, Трайфл, Шок-коктейл, Мороженое, Чой, Напитки

  CATEGORIES (expense FIXED):
    Иҷора, Барқ, Об, Газ, Интернет, Андоз, Коммунал

  CATEGORIES (expense VARIABLE):
    Расходники, Масрафҳо

  CATEGORIES (expense PAYROLL):
    Маош, Бонус, Хӯрок, Аванс, Ҷарима

  CATEGORIES (expense OWNER_DRAW):
    Расходники Раис

  CATEGORIES (expense WASTE/FUND):
    Брак, Фондҳо

  SUPPLIERS (default 3):
    "Аки Талабшоҳ" (FRUIT)
    "Шоколадфурӯш"  (CHOCOLATE)
    "Намк"          (PACKAGING — also creates Employee)
    "Баҳрулло"      (PACKAGING — also creates Employee)

  INVENTORY ITEMS (full list):
    FRUITS (cleaningLossPct):
      Клубника KG 5kg minStock 15% loss
      Банан    KG 3kg minStock 20% loss
      Ананас   KG 2kg minStock 40% loss
      Киви     KG 2kg minStock 15% loss
      Апелсин  KG 3kg minStock 30% loss
      Себ      KG 2kg minStock 15% loss

    CHOCOLATE:
      Шоколад майда KG 2kg minStock
      Шоколад калон KG 2kg minStock

    PACKAGING — CUPS:
      Стакан 0.3 ml          PIECE 100 minStock
      Стакан 0.4 ml (с лидом) PIECE 100 minStock
      Стакан 80 см           PIECE 50  minStock
      Стакан 90 см (4-ҷой)    PIECE 50  minStock
      Стакан мороженое       PIECE 50  minStock

    PACKAGING — OTHERS:
      Салфетка влажная BLOCK 5  minStock
      Салфетка сухая   PACK  10 minStock
      Қошуқчаи мороженӣ PIECE 200 minStock
      Вилка для клубники PIECE 100 minStock
      Целлофан мелкий  PACK  3  minStock
      Целлофан крупный PACK  3  minStock
      Стикер           PIECE 200 minStock
      Трубочка         PIECE 200 minStock

  PRODUCTS (real recipes):
    Cup 0.3 Pure Strawberry — 35 TJS
      Recipe: 100g Клубника + 50g Шоколад майда + 1 Стакан 0.3 + 1 Қошуқ + 1 Салфетка
    Cup 0.3 Mix — 30 TJS
      Recipe: 50g Клубника + 50g Банан + 50g Шоколад + 1 Стакан 0.3 + 1 Қошуқ
    Cup 0.4 Pure Strawberry — 45 TJS
      Recipe: 120g Клубника + 60g Шоколад + 1 Стакан 0.4 + 1 Қошуқ
    Cup 0.4 Double — 40 TJS
      Recipe: 60g Клуб + 60g Банан + 60g Шок + 1 Стакан 0.4
    Cup 0.4 Triple — 50 TJS
      Recipe: 40g Клуб + 40g Банан + 50g Ананас + 50g Шок + 1 Стакан 0.4
    Трайфл — 25 TJS
    Шоколад коктейл — 20 TJS
    Мороженое — 15 TJS
    Чой — 8 TJS
    Напитки — 10 TJS

  EMPLOYEES (default):
    Ман       OWNER  500/day draw
    Дилшод    OWNER  500/day draw
    Саф       OWNER  250/day draw
    Намк      STAFF  isConsumableBuyer=true
    Баҳрулло  STAFF  isConsumableBuyer=true

  FUNDS (default):
    CHARITY     "Фонди Хайр"      0
    RESERVE     "Фонди Захиравӣ"   0
    RENOVATION  "Фонди Ободонӣ"   0
    EMERGENCY   "Рӯзи Мабодо"     0
    TAX_RESERVE "Захираи Андоз"   0

  CASHBOX: balance=0, cardBalance=0


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — SWAGGER (apply to EVERY file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main.ts setup:
  title:       'Choco Berry Business API'
  description: 'Daily report, BOM, inventory, sales, payroll, P&L'
  version:     '2.0.0'
  servers:     [http://localhost:3000]
  bearerAuth:  true
  tags: auth, business, suppliers, products, inventory, sales,
        expenses, employees, cashbox, funds, daily-report, reports
  url: /api/docs

EVERY controller:
  @ApiTags('tag')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '...' }) on every method
  @ApiResponse({ status: 200, type: ResponseDto })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 400 })

EVERY DTO field:
  @ApiProperty({ example, description })
  + class-validator decorator
  + class-transformer if needed (@Type, @Transform)

EVERY list endpoint:
  { data: T[], meta: { total, page, limit, totalPages } }

EVERY response wrapped by interceptor:
  { success: true, data: T, message, timestamp }

EVERY error filtered:
  { success: false, error: { code, message, details? }, timestamp }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — DOCKER & DEPLOY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

docker-compose.yml:
  services:
    postgres:
      image: postgres:16-alpine
      environment: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=chocoberry
      ports: 5432:5432
      volumes: pgdata:/var/lib/postgresql/data
      healthcheck: pg_isready
    app:
      build: .
      depends_on: postgres (healthy)
      env_file: .env
      ports: 3000:3000
      command: sh -c "npx prisma migrate deploy && node dist/main.js"
  volumes: pgdata

Dockerfile (multi-stage):
  FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY prisma ./prisma
    RUN npx prisma generate
    COPY . .
    RUN npm run build
  FROM node:20-alpine AS runner
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev && npm install -g prisma
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    EXPOSE 3000
    CMD ["node", "dist/main.js"]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — ABSOLUTE RULES (enforced everywhere)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1.  Money = Prisma.Decimal ALWAYS. Never number/float for TJS.
  2.  All multi-write DB ops in $transaction() — atomic.
  3.  Stock NEVER goes < 0. Throw ConflictException with item name.
  4.  Sale auto-deducts BOM. If any ingredient missing → reject ALL.
  5.  Employee pay always creates Expense + FinancialTransaction.
  6.  Sale always creates FinancialTransaction (INCOME).
  7.  Supplier purchase always creates Expense + Inventory IN + price history.
  8.  Cleaning creates 2 InventoryTransactions (OUT raw + IN cleaned).
  9.  Every list endpoint: pagination meta.
  10. All dates: UTC stored, ISO 8601 returned.
  11. Passwords: bcrypt 10 rounds, never plain text.
  12. JWT guards on ALL routes except /auth/register, /auth/login.
  13. CORS: configured from ALLOWED_ORIGINS env.
  14. Rate limit: ThrottlerModule on /auth (10/min).
  15. ZERO `// TODO`, `throw new Error('not implemented')`, `return null` placeholders.
  16. `npm run build` MUST succeed with 0 TS errors.
  17. `npx prisma migrate dev` MUST succeed without manual intervention.
  18. Swagger at /api/docs MUST show all 12 tag groups, all endpoints.
  19. Validate suppliersTotal === totalSales in daily report (throw if not).
  20. Every numeric DTO field uses @Type(() => Number) for query params.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — GENERATION ORDER (follow EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1.  package.json + tsconfig.json + nest-cli.json
  2.  .env + .env.example + .gitignore
  3.  prisma/schema.prisma (FULL — all models above)
  4.  → run: npx prisma format
  5.  → run: npx prisma migrate dev --name init
  6.  → run: npx prisma generate
  7.  src/main.ts (Swagger, CORS, global pipes/filters/interceptors)
  8.  src/app.module.ts (imports ALL modules + ConfigModule + ThrottlerModule)
  9.  src/prisma/prisma.service.ts
  10. src/config/configuration.ts
  11. src/common/* (decorators, guards, filters, interceptors, utils, dto)
  12. src/modules/auth/*
  13. src/modules/business/*  (with full setupDefaults)
  14. src/modules/suppliers/* (NEW)
  15. src/modules/products/*
  16. src/modules/inventory/* (with cleaning endpoint)
  17. src/modules/sales/* (with BOM auto-deduction)
  18. src/modules/expenses/*
  19. src/modules/employees/* (with payroll calc + fines)
  20. src/modules/cashbox/*
  21. src/modules/funds/* (NEW)
  22. src/modules/daily-report/*
  23. src/modules/reports/* (with Excel/PDF export)
  24. docker-compose.yml + Dockerfile
  25. README.md (with curl examples for top 10 endpoints)
  26. → run: npm run build  (MUST be 0 errors — fix any errors)
  27. → run: docker-compose up -d
  28. → verify: curl http://localhost:3000/api/docs returns HTML
  29. → smoke test:
        POST /api/v1/auth/register     # creates owner
        POST /api/v1/auth/login        # gets JWT
        POST /api/v1/business/setup    # seeds defaults
        POST /api/v1/suppliers/{id}/purchase  # buy 120kg strawberry
        POST /api/v1/inventory/{id}/cleaning  # 120kg → 100kg
        POST /api/v1/sales             # sell 1× cup-0.3-pure
        POST /api/v1/daily-report      # full day report
        GET  /api/v1/reports/profit?from=2026-05-01&to=2026-05-31

  IF ANY STEP FAILS:
    - Read the actual error message
    - Fix the specific file
    - Re-run the failed step
    - DO NOT proceed to next step until current is green


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — FINAL CHECKLIST (verify before delivery)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ ] All Prisma models from PART 3 exist verbatim
  [ ] Migration applied successfully
  [ ] All 12 modules created (PART 4)
  [ ] All endpoints from PART 5 implemented and respond
  [ ] BOM auto-deduction works on sale (test: stock decreases)
  [ ] Cleaning endpoint creates raw OUT + cleaned IN transactions
  [ ] Supplier purchase: box→kg auto + cup forecast working
  [ ] Daily report validation: suppliers sum = total sales
  [ ] Charity formula correct: MAX(0, income - expenses - remaining)
  [ ] Payroll: bonus = monthSales × bonusPercent − fines − advances
  [ ] MIXED payment: cashAmount + cardAmount = total
  [ ] All DTOs have @ApiProperty + class-validator
  [ ] Swagger /api/docs shows ALL tag groups, ALL endpoints
  [ ] JWT auth blocks unauthenticated routes
  [ ] Public routes: only /auth/register and /auth/login
  [ ] npm run build → 0 TypeScript errors
  [ ] npm run start:prod runs without crash
  [ ] docker-compose up runs DB + app together
  [ ] No `TODO`, `not implemented`, mock data anywhere in src/



GOOGLE_AI_API_KEY=AIzaSyCeXi26uaNZQzIv_f_k5bAqRczpnNKwWTo