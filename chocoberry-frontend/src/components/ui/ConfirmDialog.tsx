import { useTranslation } from 'react-i18next'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { LoadingSpinner } from './LoadingSpinner'

export interface ConfirmDialogProps {
  open: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  isLoading?: boolean
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel,
  isLoading,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const handleClose = onClose ?? onCancel ?? (() => {})

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || t('actions.confirm')}</DialogTitle>
          <DialogDescription>
            {description || t('confirm.delete')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {confirmLabel || t('actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
