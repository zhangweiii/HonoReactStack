import { Hono } from 'hono'
import { cors } from 'hono/cors'
import api from './routes/api'
import { Env } from './services/db'

// 扩展 Env 类型以包含 ASSETS
type EnvWithAssets = Env & {
  ASSETS?: {
    fetch: (req: Request) => Promise<Response>;
  };
};

// 创建服务器实例
const server = new Hono<{ Bindings: EnvWithAssets }>()

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
  // 在开发环境中，为所有 SPA 路由返回适当的响应
  // 这将捕获所有客户端路由，如 /users, /about 等
  server.get('*', (c) => {
    const url = new URL(c.req.url)
    const path = url.pathname

    // 检查是否是 API 路由 (这些应该已经被前面的路由处理器处理)
    if (path.startsWith('/api/')) {
      return c.json({ error: 'API 路由不存在' }, 404)
    }

    // 对于所有其他路由，返回开发环境消息
    return c.json({
      message: `开发环境中，前端资源由 Vite 提供，请访问 http://localhost:3000${path}`,
      status: 'ok',
      env: 'development',
      path: path
    })
  })
} else {
  // 生产环境下的静态资源处理
  server.get('*', async (c) => {
    // 确保 ASSETS 绑定存在
    if (!c.env.ASSETS) {
      return c.text('ASSETS 绑定未配置', 500)
    }

    const url = new URL(c.req.url)
    const path = url.pathname

    // 检查是否是 API 路由 (这些应该已经被前面的路由处理器处理)
    if (path.startsWith('/api/')) {
      return c.json({ error: 'API 路由不存在' }, 404)
    }

    try {
      // 尝试获取静态资源
      const response = await c.env.ASSETS.fetch(new Request(c.req.url, {
        method: c.req.method,
        headers: c.req.raw.headers
      }))

      // 如果资源存在，返回它
      if (response.status !== 404) {
        return response
      }

      // 否则回退到 index.html 以支持 SPA 路由
      return await c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, {
        method: 'GET',
        headers: c.req.raw.headers
      }))
    } catch (e) {
      // 如果出现错误，返回 index.html 以支持 SPA 路由
      return await c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, {
        method: 'GET',
        headers: c.req.raw.headers
      }))
    }
  })
}

export default server
