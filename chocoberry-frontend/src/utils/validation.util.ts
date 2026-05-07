import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const supplierSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['FRUIT', 'CHOCOLATE', 'PACKAGING', 'OTHER']),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const supplierPurchaseSchema = z
  .object({
    inventoryItemId: z.string().uuid(),
    unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK', 'BLOCK', 'DOZEN', 'TON']),
    quantity: z.string().optional(),
    boxCount: z.number().optional(),
    kgPerBox: z.string().optional(),
    pricePerUnit: z.string().min(1),
    notes: z.string().optional(),
  })
  .refine((data) => data.quantity || (data.boxCount && data.kgPerBox), {
    message: 'Provide either quantity or box count + kg per box',
  })

export const productSchema = z.object({
  name: z.string().min(1),
  nameTg: z.string().optional(),
  nameRu: z.string().optional(),
  cupType: z.enum(['CUP_300_ML', 'CUP_400_ML', 'CUP_80SM', 'CUP_90SM', 'CUP_ICE_CREAM', 'OTHER']).optional(),
  variant: z.string().optional(),
  price: z.string().min(1),
  unit: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const inventoryItemSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['FRUIT', 'CHOCOLATE', 'PACKAGING', 'OTHER']),
  unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK', 'BLOCK', 'DOZEN', 'TON']),
  minStockLevel: z.string().min(1),
  cleaningLossPct: z.string().optional(),
})

export const stockInSchema = z.object({
  quantity: z.string().min(1),
  unitCost: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
})

export const stockOutSchema = z.object({
  quantity: z.string().min(1),
  reason: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
})

export const wasteSchema = z.object({
  quantity: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
  date: z.string().optional(),
})

export const cleaningSchema = z.object({
  rawQuantity: z.string().min(1),
  actualCleanedQuantity: z.string().optional(),
  notes: z.string().optional(),
})

export const createSaleSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().min(0.01),
        })
      )
      .min(1),
    paymentMethod: z.enum(['CASH', 'CARD', 'MIXED']),
    cashAmount: z.string().default('0'),
    cardAmount: z.string().default('0'),
    discount: z.string().default('0'),
  })
  .refine(() => true)

export const expenseSchema = z.object({
  expenseType: z.enum(['FIXED', 'VARIABLE', 'PAYROLL', 'OWNER_DRAW', 'CONSUMABLE', 'WASTE', 'COGS', 'FUND', 'OTHER']),
  categoryId: z.string().optional(),
  amount: z.string().min(1),
  description: z.string().optional(),
  vendor: z.string().optional(),
  employeeId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'MIXED']).optional(),
  date: z.string().optional(),
})

export const employeeSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'CASHIER']),
  salary: z.string().min(1),
  bonusPercent: z.string().optional(),
  isOwner: z.boolean().optional(),
  isConsumableBuyer: z.boolean().optional(),
  hireDate: z.string().optional(),
})

export const payEmployeeSchema = z.object({
  paymentType: z.enum(['SALARY', 'ADVANCE', 'BONUS', 'LUNCH', 'FINE', 'OWNER_DRAW', 'OTHER']),
  amount: z.string().min(1),
  period: z.string().optional(),
  notes: z.string().optional(),
})

export const fineSchema = z.object({
  amount: z.string().min(1),
  reason: z.string().min(1),
  date: z.string().optional(),
})

export const shiftSchema = z.object({
  startTime: z.string().min(1),
  endTime: z.string().optional(),
  notes: z.string().optional(),
})

export const cashboxOperationSchema = z.object({
  type: z.enum(['CASH_IN', 'CASH_OUT']),
  amount: z.string().min(1),
  description: z.string().optional(),
})

export const fundTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.string().min(1),
  notes: z.string().optional(),
})

export const dailyReportSchema = z.object({
  date: z.string().min(1),
  totalSales: z.string().min(1),
  locations: z
    .array(
      z.object({
        label: z.string().min(1),
        amount: z.string().min(1),
      })
    )
    .optional(),
  extraIncome: z
    .array(
      z.object({
        label: z.string().min(1),
        amount: z.string().min(1),
      })
    )
    .optional(),
  operationalExp: z.string().optional(),
  consumables: z
    .array(
      z.object({
        employeeId: z.string(),
        amount: z.string(),
      })
    )
    .optional(),
  ownerDraws: z
    .array(
      z.object({
        employeeId: z.string(),
        amount: z.string(),
      })
    )
    .optional(),
  supplierPurchases: z
    .array(
      z.object({
        supplierId: z.string(),
        amount: z.string(),
      })
    )
    .optional(),
  charityAmount: z.string().optional(),
  notes: z.string().optional(),
})

export const businessSetupSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['FOOD', 'RETAIL', 'SERVICE', 'OTHER']),
  address: z.string().optional(),
  phone: z.string().optional(),
  bonusPercent: z.string().optional(),
})

// Aliases used in forms
export const createExpenseSchema = expenseSchema
export const createEmployeeSchema = employeeSchema
export const addFineSchema = fineSchema
export const createDailyReportSchema = dailyReportSchema
