import { Hono } from 'hono'
import server from './server'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// 挂载服务器路由
app.route('/', server)

export default app