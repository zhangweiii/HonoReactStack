import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const AboutPage = () => {
  const { t } = useTranslation('about')
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('technologies.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t('technologies.frontend')}</h3>
            <ul className="list-disc pl-6 mt-2">
              {(t('technologies.frontendItems', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">{t('technologies.backend')}</h3>
            <ul className="list-disc pl-6 mt-2">
              {(t('technologies.backendItems', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('structure.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
{`/wssdev
  /src
    /client          # React 前端代码
      /components    # React 组件
      /hooks         # 自定义 hooks
      /pages         # 页面组件
      /styles        # CSS 样式
      main.tsx       # 入口文件
    /server          # Hono 后端代码
      /routes        # API 路由
      /middleware    # 中间件
      index.ts       # 后端入口
    index.ts         # Workers 入口`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

export default AboutPage
