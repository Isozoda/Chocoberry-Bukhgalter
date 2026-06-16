import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import tjAttendance from './locales/tj/attendance.json'
import tjCommon from './locales/tj/common.json'
import tjDashboard from './locales/tj/dashboard.json'
import tjSales from './locales/tj/sales.json'
import tjInventory from './locales/tj/inventory.json'
import tjSuppliers from './locales/tj/suppliers.json'
import tjProducts from './locales/tj/products.json'
import tjExpenses from './locales/tj/expenses.json'
import tjEmployees from './locales/tj/employees.json'
import tjCashbox from './locales/tj/cashbox.json'
import tjDailyReport from './locales/tj/daily-report.json'
import tjReports from './locales/tj/reports.json'
import tjBusiness from './locales/tj/business.json'
import tjAuth from './locales/tj/auth.json'
import tjAccounting from './locales/tj/accounting.json'

import ruAttendance from './locales/ru/attendance.json'
import ruCommon from './locales/ru/common.json'
import ruDashboard from './locales/ru/dashboard.json'
import ruSales from './locales/ru/sales.json'
import ruInventory from './locales/ru/inventory.json'
import ruSuppliers from './locales/ru/suppliers.json'
import ruProducts from './locales/ru/products.json'
import ruExpenses from './locales/ru/expenses.json'
import ruEmployees from './locales/ru/employees.json'
import ruCashbox from './locales/ru/cashbox.json'
import ruDailyReport from './locales/ru/daily-report.json'
import ruReports from './locales/ru/reports.json'
import ruBusiness from './locales/ru/business.json'
import ruAuth from './locales/ru/auth.json'
import ruAccounting from './locales/ru/accounting.json'

import enAttendance from './locales/en/attendance.json'
import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enSales from './locales/en/sales.json'
import enInventory from './locales/en/inventory.json'
import enSuppliers from './locales/en/suppliers.json'
import enProducts from './locales/en/products.json'
import enExpenses from './locales/en/expenses.json'
import enEmployees from './locales/en/employees.json'
import enCashbox from './locales/en/cashbox.json'
import enDailyReport from './locales/en/daily-report.json'
import enReports from './locales/en/reports.json'
import enBusiness from './locales/en/business.json'
import enAuth from './locales/en/auth.json'
import enAccounting from './locales/en/accounting.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tj',
    supportedLngs: ['tj', 'ru', 'en'],
    defaultNS: 'common',
    ns: [
      'common',
      'attendance',
      'dashboard',
      'sales',
      'inventory',
      'suppliers',
      'products',
      'expenses',
      'employees',
      'cashbox',
      'daily-report',
      'reports',
      'business',
      'auth',
      'accounting',
    ],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'chocoberry_lang',
    },
    resources: {
      tj: {
        common: tjCommon,
        attendance: tjAttendance,
        dashboard: tjDashboard,
        sales: tjSales,
        inventory: tjInventory,
        suppliers: tjSuppliers,
        products: tjProducts,
        expenses: tjExpenses,
        employees: tjEmployees,
        cashbox: tjCashbox,
        'daily-report': tjDailyReport,
        reports: tjReports,
        business: tjBusiness,
        auth: tjAuth,
        accounting: tjAccounting,
      },
      ru: {
        common: ruCommon,
        attendance: ruAttendance,
        dashboard: ruDashboard,
        sales: ruSales,
        inventory: ruInventory,
        suppliers: ruSuppliers,
        products: ruProducts,
        expenses: ruExpenses,
        employees: ruEmployees,
        cashbox: ruCashbox,
        'daily-report': ruDailyReport,
        reports: ruReports,
        business: ruBusiness,
        auth: ruAuth,
        accounting: ruAccounting,
      },
      en: {
        common: enCommon,
        attendance: enAttendance,
        dashboard: enDashboard,
        sales: enSales,
        inventory: enInventory,
        suppliers: enSuppliers,
        products: enProducts,
        expenses: enExpenses,
        employees: enEmployees,
        cashbox: enCashbox,
        'daily-report': enDailyReport,
        reports: enReports,
        business: enBusiness,
        auth: enAuth,
        accounting: enAccounting,
      },
    },
  })

export default i18n
