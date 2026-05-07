import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Eye, Edit, Trash2, ShoppingCart } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import SupplierFormDialog from './SupplierFormDialog'
import PurchaseForm from './PurchaseForm'
import type { Supplier } from '@/types/supplier.types'

export default function SuppliersPage() {
  const { t } = useTranslation('suppliers')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [purchaseSupplier, setPurchaseSupplier] = useState<Supplier | null>(null)
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { page, limit, search: debouncedSearch, type: typeFilter }],
    queryFn: () => suppliersApi.list({
      page,
      limit,
      search: debouncedSearch || undefined,
      type: typeFilter || undefined,
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success(t('common:toast.deleted'))
      setDeleteId(null)
    },
  })

  const typeVariant: Record<string, 'default' | 'secondary' | 'info' | 'success'> = {
    FRUIT: 'success',
    CHOCOLATE: 'default',
    PACKAGING: 'secondary',
    OTHER: 'secondary',
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={<Button onClick={() => { setEditSupplier(null); setFormOpen(true) }}><Plus className="h-4 w-4 mr-1" />{t('addSupplier')}</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder={t('common:labels.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('common:labels.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="FRUIT">{t('fruit')}</SelectItem>
            <SelectItem value="CHOCOLATE">{t('chocolate')}</SelectItem>
            <SelectItem value="PACKAGING">{t('packaging')}</SelectItem>
            <SelectItem value="OTHER">{t('other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        keyExtractor={(row) => row.id as string}
        columns={[
          { key: 'name', header: t('common:labels.name'), sortable: true },
          {
            key: 'type',
            header: t('common:labels.type'),
            render: (row) => (
              <Badge variant={typeVariant[row.type as string] || 'secondary'}>
                {t(row.type?.toString().toLowerCase() || 'other')}
              </Badge>
            ),
          },
          { key: 'phone', header: t('phone') },
          {
            key: 'isActive',
            header: t('common:labels.status'),
            render: (row) => (
              <Badge variant={row.isActive ? 'success' : 'secondary'}>
                {row.isActive ? t('active') : t('inactive')}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-48',
            render: (row) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => navigate(`/app/suppliers/${row.id}`)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditSupplier(row as Supplier); setFormOpen(true) }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPurchaseSupplier(row as Supplier)}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.id as string)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <SupplierFormDialog
        open={formOpen}
        supplier={editSupplier}
        onClose={() => setFormOpen(false)}
      />

      <Sheet open={!!purchaseSupplier} onOpenChange={(o) => !o && setPurchaseSupplier(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {t('purchase')} — {purchaseSupplier?.name}
            </SheetTitle>
          </SheetHeader>
          {purchaseSupplier && (
            <PurchaseForm
              supplier={purchaseSupplier}
              onSuccess={() => setPurchaseSupplier(null)}
            />
          )}
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
