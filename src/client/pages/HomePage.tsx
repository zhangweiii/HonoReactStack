import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from 'react-i18next'

interface Message {
  message: string
}

const HomePage = () => {
  const { data, loading, error, fetchData } = useApi<Message>()
  const { t } = useTranslation('home')

  useEffect(() => {
    fetchMessage()
  }, [])

  const fetchMessage = async () => {
    await fetchData({
      endpoint: '/api/hello',
      onError: (error) => console.error(`${t('apiMessage.error')}:`, error)
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('welcome')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('apiMessage.title')}</CardTitle>
          <CardDescription>{t('apiMessage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>{t('apiMessage.loading')}</p>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-red-500">{t('apiMessage.error')} {error.message}</p>
              <Button onClick={fetchMessage}>{t('apiMessage.retry')}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">{data?.message || t('apiMessage.noMessage')}</p>
              <Button onClick={fetchMessage}>{t('apiMessage.refresh')}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
