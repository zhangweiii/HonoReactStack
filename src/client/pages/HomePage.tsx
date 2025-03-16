import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'

interface Message {
  message: string
}

const HomePage = () => {
  const { data, loading, error, fetchData } = useApi<Message>()

  useEffect(() => {
    fetchMessage()
  }, [])

  const fetchMessage = async () => {
    await fetchData({
      endpoint: '/api/hello',
      onError: (error) => console.error('获取消息失败:', error)
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">欢迎使用 Hono + React + shadcn UI</h1>
      <p className="text-muted-foreground">这是一个使用 Hono 作为后端，React 和 shadcn UI 作为前端的示例项目。</p>
      
      <Card>
        <CardHeader>
          <CardTitle>来自 API 的消息</CardTitle>
          <CardDescription>这个消息从 Hono API 获取</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>加载中...</p>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-red-500">错误: {error.message}</p>
              <Button onClick={fetchMessage}>重试</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">{data?.message || '无消息'}</p>
              <Button onClick={fetchMessage}>刷新消息</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
