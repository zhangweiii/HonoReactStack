import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// 创建 API 路由
const api = new Hono()

// 模拟用户数据存储
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
]

// 获取下一个用户 ID
const getNextId = () => {
  return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1
}

// 定义 API 路由
api.get('/hello', (c) => {
  return c.json({
    message: '你好，这是来自 Hono API 的消息！'
  })
})

// 获取所有用户
api.get('/users', (c) => {
  return c.json(users)
})

// 获取单个用户
api.get('/users/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const user = users.find(u => u.id === id)
  
  if (!user) {
    return c.json({ error: '用户不存在' }, 404)
  }
  
  return c.json(user)
})

// 创建用户验证器
const createUserSchema = z.object({
  name: z.string().min(2, '名称至少需要 2 个字符'),
  email: z.string().email('请提供有效的电子邮件地址')
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
  name: z.string().min(2, '名称至少需要 2 个字符').optional(),
  email: z.string().email('请提供有效的电子邮件地址').optional()
})

// 更新用户
api.put('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = parseInt(c.req.param('id'))
  const userData = await c.req.json()
  
  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) {
    return c.json({ error: '用户不存在' }, 404)
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
    return c.json({ error: '用户不存在' }, 404)
  }
  
  // 删除用户
  const deletedUser = users[userIndex]
  users = users.filter(u => u.id !== id)
  
  return c.json({ message: '用户已删除', user: deletedUser })
})

export default api
