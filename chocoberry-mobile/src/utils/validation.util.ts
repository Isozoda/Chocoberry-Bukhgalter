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
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export const supplierPurchaseSchema = z
  .object({
    inventoryItemId: z.string().min(1),
    unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK', 'BLOCK', 'TON']),
    quantity: z.string().optional(),
    boxCount: z.number().min(1).optional(),
    kgPerBox: z.string().optional(),
    pricePerUnit: z.string().min(1),
    notes: z.string().optional(),
  })
  .refine((d) => d.quantity || (d.boxCount && d.kgPerBox), {
    message: 'Миқдор ё шумораи қутиҳо ворид кунед',
  })

export const cleaningSchema = z.object({
  rawQuantity: z.string().min(1),
  actualCleanedQuantity: z.string().optional(),
  notes: z.string().optional(),
})

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().min(0.01),
      })
    )
    .min(1),
  paymentMethod: z.enum(['CASH', 'CARD', 'MIXED']),
  cashAmount: z.string().default('0'),
  cardAmount: z.string().default('0'),
  discount: z.string().default('0'),
})

export const fineSchema = z.object({
  amount: z.string().min(1),
  reason: z.string().min(3),
  date: z.string(),
})

export const expenseSchema = z.object({
  expenseType: z.enum(['FIXED', 'VARIABLE', 'PAYROLL', 'OWNER_DRAW', 'CONSUMABLE', 'WASTE', 'FUND']),
  amount: z.string().min(1),
  description: z.string().optional(),
  vendor: z.string().optional(),
  employeeId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MIXED']),
  date: z.string(),
})

export const dailyReportSchema = z.object({
  date: z.string(),
  totalSales: z.string().min(1),
  operationalExpenses: z.string().optional(),
})
