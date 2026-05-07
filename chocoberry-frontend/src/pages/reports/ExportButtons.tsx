import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/utils/export.util'
import { reportsApi } from '@/api/reports.api'
import toast from 'react-hot-toast'

interface Props {
  reportType: string
  params?: Record<string, string | undefined>
}

export function ExportButtons({ reportType, params }: Props) {
  const { t } = useTranslation('reports')

  const cleanParams = (p?: Record<string, string | undefined>): Record<string, string> =>
    Object.fromEntries(Object.entries(p ?? {}).filter(([, v]) => v != null) as [string, string][])

  const exportExcel = async () => {
    try {
      const blob = await reportsApi.exportExcel({ type: reportType, ...cleanParams(params) })
      downloadBlob(blob, `${reportType}-report.xlsx`)
      toast.success(t('exportSuccess'))
    } catch {
      toast.error(t('exportError'))
    }
  }

  const exportPdf = async () => {
    try {
      const blob = await reportsApi.exportPdf({ type: reportType, ...cleanParams(params) })
      downloadBlob(blob, `${reportType}-report.pdf`)
      toast.success(t('exportSuccess'))
    } catch {
      toast.error(t('exportError'))
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportExcel}>
        <Download className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportPdf}>
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  )
}
