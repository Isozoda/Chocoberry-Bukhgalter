import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import tgCommon from './locales/tg/common.json'
import tgDashboard from './locales/tg/dashboard.json'
import tgSales from './locales/tg/sales.json'
import tgInventory from './locales/tg/inventory.json'
import tgSuppliers from './locales/tg/suppliers.json'
import tgProducts from './locales/tg/products.json'
import tgExpenses from './locales/tg/expenses.json'
import tgEmployees from './locales/tg/employees.json'
import tgCashbox from './locales/tg/cashbox.json'
import tgFunds from './locales/tg/funds.json'
import tgDailyReport from './locales/tg/daily-report.json'
import tgReports from './locales/tg/reports.json'
import tgBusiness from './locales/tg/business.json'

import ruCommon from './locales/ru/common.json'
import ruDashboard from './locales/ru/dashboard.json'
import ruSales from './locales/ru/sales.json'
import ruInventory from './locales/ru/inventory.json'
import ruSuppliers from './locales/ru/suppliers.json'
import ruProducts from './locales/ru/products.json'
import ruExpenses from './locales/ru/expenses.json'
import ruEmployees from './locales/ru/employees.json'
import ruCashbox from './locales/ru/cashbox.json'
import ruFunds from './locales/ru/funds.json'
import ruDailyReport from './locales/ru/daily-report.json'
import ruReports from './locales/ru/reports.json'
import ruBusiness from './locales/ru/business.json'

import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enSales from './locales/en/sales.json'
import enInventory from './locales/en/inventory.json'
import enSuppliers from './locales/en/suppliers.json'
import enProducts from './locales/en/products.json'
import enExpenses from './locales/en/expenses.json'
import enEmployees from './locales/en/employees.json'
import enCashbox from './locales/en/cashbox.json'
import enFunds from './locales/en/funds.json'
import enDailyReport from './locales/en/daily-report.json'
import enReports from './locales/en/reports.json'
import enBusiness from './locales/en/business.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tg',
    supportedLngs: ['tg', 'ru', 'en'],
    defaultNS: 'common',
    ns: [
      'common',
      'dashboard',
      'sales',
      'inventory',
      'suppliers',
      'products',
      'expenses',
      'employees',
      'cashbox',
      'funds',
      'daily-report',
      'reports',
      'business',
    ],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'chocoberry_lang',
    },
    resources: {
      tg: {
        common: tgCommon,
        dashboard: tgDashboard,
        sales: tgSales,
        inventory: tgInventory,
        suppliers: tgSuppliers,
        products: tgProducts,
        expenses: tgExpenses,
        employees: tgEmployees,
        cashbox: tgCashbox,
        funds: tgFunds,
        'daily-report': tgDailyReport,
        reports: tgReports,
        business: tgBusiness,
      },
      ru: {
        common: ruCommon,
        dashboard: ruDashboard,
        sales: ruSales,
        inventory: ruInventory,
        suppliers: ruSuppliers,
        products: ruProducts,
        expenses: ruExpenses,
        employees: ruEmployees,
        cashbox: ruCashbox,
        funds: ruFunds,
        'daily-report': ruDailyReport,
        reports: ruReports,
        business: ruBusiness,
      },
      en: {
        common: enCommon,
        dashboard: enDashboard,
        sales: enSales,
        inventory: enInventory,
        suppliers: enSuppliers,
        products: enProducts,
        expenses: enExpenses,
        employees: enEmployees,
        cashbox: enCashbox,
        funds: enFunds,
        'daily-report': enDailyReport,
        reports: enReports,
        business: enBusiness,
      },
    },
  })

export default i18n
