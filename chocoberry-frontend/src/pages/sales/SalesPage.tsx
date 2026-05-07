import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import POSTerminal from './POSTerminal'
import SalesHistory from './SalesHistory'

export default function SalesPage() {
  const { t } = useTranslation('sales')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">{t('pos')}</TabsTrigger>
          <TabsTrigger value="history">{t('history')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pos" className="mt-4">
          <POSTerminal />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <SalesHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
