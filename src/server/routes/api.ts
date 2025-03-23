import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getCookie } from 'hono/cookie'

// 创建 API 路由
const api = new Hono()

// 语言消息
const messages = {
  'zh-CN': {
    hello: '你好，这是来自 Hono API 的消息！',
    userNotFound: '用户不存在',
    userDeleted: '用户已删除',
    nameMinLength: '名称至少需要 2 个字符',
    invalidEmail: '请提供有效的电子邮件地址'
  },
  'en': {
    hello: 'Hello, this is a message from the Hono API!',
    userNotFound: 'User not found',
    userDeleted: 'User deleted',
    nameMinLength: 'Name must be at least 2 characters',
    invalidEmail: 'Please provide a valid email address'
  }
}

// 获取语言中间件
const getLanguage = (c: any) => {
  // 从 cookie 中获取语言设置
  const lang = getCookie(c, 'i18nextLng') || 'zh-CN'
  console.log('Current language from cookie:', lang)
  // 只支持 zh-CN 和 en
  return lang === 'en' ? 'en' : 'zh-CN'
}

// 模拟用户数据存储
const usersData = {
  'zh-CN': [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ],
  'en': [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ]
}

// 用户数据存储
let users = [...usersData['zh-CN']]

// 获取下一个用户 ID
const getNextId = () => {
  return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1
}

// 定义 API 路由
api.get('/hello', (c) => {
  const lang = getLanguage(c)
  return c.json({
    message: messages[lang].hello
  })
})

// 获取所有用户
api.get('/users', (c) => {
  const lang = getLanguage(c)
  // 根据语言选择用户数据
  users = [...usersData[lang]]
  return c.json(users)
})

// 获取单个用户
api.get('/users/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const user = users.find(u => u.id === id)

  if (!user) {
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].userNotFound }, 404)
  }

  return c.json(user)
})

// 创建用户验证器
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

// 创建用户
api.post('/users', zValidator('json', createUserSchema), async (c) => {
  const userData = await c.req.json()
  const newUser = {
    id: getNextId(),
    name: userData.name,
    email: userData.email
  }

  users.push(newUser)
  return c.json(newUser, 201)
})

// 更新用户验证器
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional()
})

// 更新用户
api.put('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = parseInt(c.req.param('id'))
  const userData = await c.req.json()

  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) {
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].userNotFound }, 404)
  }

  // 更新用户数据
  users[userIndex] = {
    ...users[userIndex],
    ...userData
  }

  return c.json(users[userIndex])
})

// 删除用户
api.delete('/users/:id', (c) => {
  const id = parseInt(c.req.param('id'))

  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) {
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].userNotFound }, 404)
  }

  // 删除用户
  const deletedUser = users[userIndex]
  users = users.filter(u => u.id !== id)

  const lang = getLanguage(c)
  return c.json({ message: messages[lang].userDeleted, user: deletedUser })
})

export default api
