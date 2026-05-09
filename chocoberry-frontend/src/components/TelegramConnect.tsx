import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { telegramApi } from '@/api/telegram.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Send, CheckCircle2, XCircle, Copy, ExternalLink, QrCode } from 'lucide-react'
import telegramQr from '@/assets/chocoberry_telegram_qr.png'

export function TelegramConnect() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const [connectUrl, setConnectUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: status, isLoading } = useQuery({
    queryKey: ['telegram-status'],
    queryFn: telegramApi.getStatus,
  })

  const connectMutation = useMutation({
    mutationFn: telegramApi.getConnectLink,
    onSuccess: (data) => {
      setConnectUrl(data.url)
    },
    onError: () => toast.error(t('telegram.connectError')),
  })

  const disconnectMutation = useMutation({
    mutationFn: telegramApi.unsubscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] })
      setConnectUrl(null)
      toast.success(t('telegram.disconnected'))
    },
    onError: () => toast.error(t('telegram.disconnectError')),
  })

  const copyLink = async () => {
    if (!connectUrl) return
    try {
      await navigator.clipboard.writeText(connectUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('telegram.copyError'))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-24">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-400" />
          {t('telegram.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.linked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('telegram.connected')}</span>
            </div>
            {status.linkedAt && (
              <p className="text-xs text-zinc-500">
                {t('telegram.connectedAt')}: {new Date(status.linkedAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-zinc-400">{t('telegram.connectedDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              {disconnectMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {t('telegram.disconnect')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{t('telegram.description')}</p>

            {!connectUrl ? (
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {connectMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t('telegram.connect')}
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-300">{t('telegram.openLink')}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={connectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('telegram.openTelegram')}
                  </a>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? t('telegram.copied') : t('telegram.copyLink')}
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
                  <div className="relative group">
                    <img 
                      src={telegramQr} 
                      alt="Telegram QR" 
                      className="w-40 h-40 rounded-lg border border-zinc-700 p-2 bg-white"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 text-center">
                    QR-кодро скан кунед, то бот дар телефони шумо кушода шавад
                  </p>
                </div>

                <p className="text-xs text-zinc-500">{t('telegram.linkExpiry')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConnectUrl(null)}
                  className="text-zinc-500"
                >
                  {t('telegram.cancel')}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
