import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/ui/PageHeader'
import ProfitReport from './ProfitReport'
import MonthlyReport from './MonthlyReport'
import TopProductsReport from './TopProductsReport'
import HotHoursReport from './HotHoursReport'
import SupplierBreakdownReport from './SupplierBreakdownReport'
import PayrollReport from './PayrollReport'

export default function ReportsPage() {
  const { t } = useTranslation('reports')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={BarChart3}
      />

      <Tabs defaultValue="profit">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="profit">{t('tabs.profit')}</TabsTrigger>
          <TabsTrigger value="monthly">{t('tabs.monthly')}</TabsTrigger>
          <TabsTrigger value="products">{t('tabs.products')}</TabsTrigger>
          <TabsTrigger value="hotHours">{t('tabs.hotHours')}</TabsTrigger>
          <TabsTrigger value="suppliers">{t('tabs.suppliers')}</TabsTrigger>
          <TabsTrigger value="payroll">{t('tabs.payroll')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profit" className="mt-6">
          <ProfitReport />
        </TabsContent>
        <TabsContent value="monthly" className="mt-6">
          <MonthlyReport />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <TopProductsReport />
        </TabsContent>
        <TabsContent value="hotHours" className="mt-6">
          <HotHoursReport />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          <SupplierBreakdownReport />
        </TabsContent>
        <TabsContent value="payroll" className="mt-6">
          <PayrollReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
