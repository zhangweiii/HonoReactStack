import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const AboutPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">关于本项目</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>技术栈</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">前端</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>React - 用户界面库</li>
              <li>React Router - 客户端路由</li>
              <li>shadcn UI - 组件库</li>
              <li>Tailwind CSS - 样式</li>
              <li>Vite - 构建工具</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">后端</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Hono - 轻量级 Web 框架</li>
              <li>Cloudflare Workers - 边缘计算平台</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>项目结构</CardTitle>
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
