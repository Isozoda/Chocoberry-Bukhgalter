import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Brush, Leaf, ChevronDown, History, Trash2 } from 'lucide-react'
import { inventoryApi } from '@/api/inventory.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { InventoryItem } from '@/types/inventory.types'
import StockInForm from './StockInForm'
import StockOutForm from './StockOutForm'
import WasteForm from './WasteForm'
import CleaningForm from './CleaningForm'
import InventoryItemFormDialog from './InventoryItemFormDialog'

const CATEGORIES = ['ALL', 'FRUITS', 'CHOCOLATE', 'PACKAGING', 'OTHER']

export default function InventoryPage() {
  const { t } = useTranslation('inventory')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [sheetMode, setSheetMode] = useState<'in' | 'out' | 'waste' | 'cleaning' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', { category: category === 'ALL' ? undefined : category }],
    queryFn: () => inventoryApi.list({ category: category === 'ALL' ? undefined : category, limit: 100 }),
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('common:toast.deleted'))
      setDeleteId(null)
    },
  })

  const openSheet = (item: InventoryItem, mode: 'in' | 'out' | 'waste' | 'cleaning') => {
    setSelectedItem(item)
    setSheetMode(mode)
  }

  const closeSheet = () => {
    setSheetMode(null)
    setSelectedItem(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-1" />{t('addItem')}</Button>}
      >
        {lowStock.length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('lowStockItems', { count: lowStock.length })}
          </Badge>
        )}
      </PageHeader>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 font-medium mb-2">
            <AlertTriangle className="h-4 w-4" />
            {t('lowStockItems', { count: lowStock.length })}
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <Badge key={item.id} variant="warning">
                {item.name}: {item.currentStock} {item.unit.toLowerCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c === 'ALL' ? 'All' : t(c.toLowerCase())}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState message={t('common:empty.noData')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((item) => {
            const isLow = parseFloat(item.currentStock) < parseFloat(item.minStockLevel)
            return (
              <Card key={item.id} className={`${isLow ? 'border-destructive/50' : ''} hover:shadow-md transition-shadow`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">{t((item.category ?? 'other').toLowerCase())}</Badge>
                    </div>
                    {isLow && <Badge variant="destructive" className="text-xs">Low</Badge>}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('currentStock')}</span>
                      <span className={`tabular-nums font-medium ${isLow ? 'text-destructive' : ''}`}>
                        {item.currentStock} {item.unit.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('minStock')}</span>
                      <span className="tabular-nums">{item.minStockLevel} {item.unit.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('avgCost')}</span>
                      <MoneyDisplay amount={item.avgCost} />
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isLow ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (parseFloat(item.currentStock) / parseFloat(item.minStockLevel)) * 50)}%` }}
                    />
                  </div>

                  <div className="flex gap-1 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openSheet(item, 'in')} title={t('stockIn')}>
                      <ArrowDownToLine className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openSheet(item, 'out')} title={t('stockOut')}>
                      <ArrowUpFromLine className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openSheet(item, 'cleaning')} title={t('cleaning')}>
                      <Brush className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openSheet(item, 'waste')} title={t('waste')}>
                      <Leaf className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate(`/app/inventory/${item.id}`)} title={t('history')}>
                      <History className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <InventoryItemFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Sheet open={!!sheetMode} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'in' && t('stockIn')}
              {sheetMode === 'out' && t('stockOut')}
              {sheetMode === 'waste' && t('waste')}
              {sheetMode === 'cleaning' && t('cleaning')}
              {selectedItem && ` — ${selectedItem.name}`}
            </SheetTitle>
          </SheetHeader>
          {selectedItem && sheetMode === 'in' && <StockInForm item={selectedItem} onSuccess={closeSheet} />}
          {selectedItem && sheetMode === 'out' && <StockOutForm item={selectedItem} onSuccess={closeSheet} />}
          {selectedItem && sheetMode === 'waste' && <WasteForm item={selectedItem} onSuccess={closeSheet} />}
          {selectedItem && sheetMode === 'cleaning' && <CleaningForm item={selectedItem} onSuccess={closeSheet} />}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
