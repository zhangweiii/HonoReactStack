import { Hono } from 'hono'
import { cors } from 'hono/cors'
import api from './routes/api'

// 导入 Cloudflare Workers 类型定义
type Env = {
  ASSETS?: {
    fetch: (req: Request) => Promise<Response>;
  };
};

// 创建服务器实例
const server = new Hono<{ Bindings: Env }>()

// 添加 CORS 中间件
server.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8787'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

// 挂载 API 路由
server.route('/api', api)

// 判断是否为开发环境
const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

// 添加健康检查端点
server.get('/health', (c) => c.json({ status: 'ok', env: isDev ? 'development' : 'production' }))

// 静态资源处理
if (isDev) {
  // 在开发环境中，返回简单的响应
  server.get('*', (c) => {
    return c.json({
      message: '开发环境中，前端资源由 Vite 提供，请访问 http://localhost:3000',
      status: 'ok',
      env: 'development'
    })
  })
} else {
  // 生产环境下的静态资源处理
  server.get('*', async (c) => {
    // 确保 ASSETS 绑定存在
    if (!c.env.ASSETS) {
      return c.text('ASSETS 绑定未配置', 500)
    }
    
    try {
      // 尝试获取静态资源
      return await c.env.ASSETS.fetch(new Request(c.req.url, {
        method: c.req.method,
        headers: c.req.raw.headers
      }))
    } catch (e) {
      // 如果静态资源不存在，返回 index.html 以支持 SPA 路由
      const url = new URL(c.req.url)
      return await c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, {
        method: 'GET',
        headers: c.req.raw.headers
      }))
    }
  })
}

export default server
