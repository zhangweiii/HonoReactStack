import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { DatabaseService, Env } from '../services/db'
import { getLanguage, messages } from '../utils/i18n'
import { User } from '../types'

// 用户认证中间件
export const authenticate = async (c: Context<{ Bindings: Env }>, next: Next) => {
  // 从请求头或 cookie 中获取用户 ID
  const userId = c.req.header('X-User-ID') || getCookie(c, 'userId')

  if (!userId) {
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].unauthorized }, 401)
  }

  try {
    // 验证用户是否存在
    const db = DatabaseService.getInstance(c.env)
    const user = await db.getUserById(parseInt(userId))

    if (!user) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].unauthorized }, 401)
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].accountDisabled }, 403)
    }

    // 将用户信息添加到请求上下文中
    c.set('user', { ...user, role: user.role as 'admin' | 'user' })

    // 继续处理请求
    await next()
  } catch (error) {
    console.error('Authentication error:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].unauthorized }, 401)
  }
}

// 管理员认证中间件
export const authenticateAdmin = async (c: Context<{ Bindings: Env }>, next: Next) => {
  // 先进行用户认证
  const authResponse = await authenticate(c, async () => {})

  // 如果认证失败，直接返回错误响应
  if (authResponse) return authResponse

  // 检查用户是否是管理员
  const user = c.get('user')
  if (user.role !== 'admin') {
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].adminRequired }, 403)
  }

  // 继续处理请求
  await next()
}
