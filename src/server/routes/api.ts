import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { DatabaseService, Env } from '../services/db'
import { getLanguage, messages } from '../utils/i18n'
import { authenticate, authenticateAdmin } from '../middleware/auth'

// 创建 API 路由
const api = new Hono<{ Bindings: Env }>()

// 定义 API 路由
api.get('/hello', (c) => {
  const lang = getLanguage(c)
  return c.json({
    message: messages[lang].hello
  })
})

// 用户相关路由
// 获取所有用户 (管理员路由)
api.get('/admin/users', authenticateAdmin, async (c) => {
  try {
    const db = DatabaseService.getInstance(c.env)
    const users = await db.getUsers()

    // 不返回密码
    const usersWithoutPassword = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return c.json(usersWithoutPassword)
  } catch (error) {
    console.error('Error fetching users:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].fetchUsersFailed }, 500)
  }
})

// 获取单个用户
api.get('/users/:id', authenticate, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = DatabaseService.getInstance(c.env)
    const user = await db.getUserById(id)

    if (!user) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    // 不返回密码
    const { password, ...userWithoutPassword } = user

    return c.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].fetchUserFailed }, 500)
  }
})

// 创建用户验证器 (管理员路由)
const createUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional()
})

// 创建用户 (管理员路由)
api.post('/admin/users', authenticateAdmin, zValidator('json', createUserSchema), async (c) => {
  try {

    const userData = await c.req.json()
    const db = DatabaseService.getInstance(c.env)

    // 检查邮箱是否已存在
    const existingUser = await db.getUserByEmail(userData.email)
    if (existingUser) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].emailExists }, 400)
    }

    const newUser = await db.createUser(userData)

    // 不返回密码
    const { password, ...userWithoutPassword } = newUser

    const lang = getLanguage(c)
    return c.json({ message: messages[lang].userCreated, user: userWithoutPassword }, 201)
  } catch (error) {
    console.error('Error creating user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].createUserFailed }, 500)
  }
})

// 更新用户验证器
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional()
})

// 更新用户个人信息
api.put('/users/:id', authenticate, zValidator('json', updateUserSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const userData = await c.req.json()
    const db = DatabaseService.getInstance(c.env)

    // 检查用户是否存在
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    // 获取当前用户信息
    const currentUser = c.get('user')

    // 确保用户只能更新自己的信息
    if (currentUser.id !== id && currentUser.role !== 'admin') {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].notYourAccount }, 403)
    }

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await db.getUserByEmail(userData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        const lang = getLanguage(c)
        return c.json({ error: messages[lang].emailInUse }, 400)
      }
    }

    // 普通用户只能更新名称、邮箱和密码，不能更新角色和激活状态
    const updatedUser = await db.updateUser(id, {
      name: userData.name,
      email: userData.email,
      password: userData.password
    })

    // 不返回密码
    const { password, ...userWithoutPassword } = updatedUser

    const lang = getLanguage(c)
    return c.json({ message: messages[lang].userUpdated, user: userWithoutPassword })
  } catch (error) {
    console.error('Error updating user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].updateUserFailed }, 500)
  }
})

// 管理员更新用户验证器
const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional()
})

// 管理员更新用户
api.put('/admin/users/:id', authenticateAdmin, zValidator('json', adminUpdateUserSchema), async (c) => {
  try {

    const id = parseInt(c.req.param('id'))
    const userData = await c.req.json()
    const db = DatabaseService.getInstance(c.env)

    // 检查用户是否存在
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await db.getUserByEmail(userData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        const lang = getLanguage(c)
        return c.json({ error: messages[lang].emailInUse }, 400)
      }
    }

    const updatedUser = await db.updateUser(id, userData)

    // 不返回密码
    const { password, ...userWithoutPassword } = updatedUser

    const lang = getLanguage(c)
    return c.json({ message: messages[lang].userUpdated, user: userWithoutPassword })
  } catch (error) {
    console.error('Error updating user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].updateUserFailed }, 500)
  }
})

// 删除用户 (管理员路由)
api.delete('/admin/users/:id', authenticateAdmin, async (c) => {
  try {

    const id = parseInt(c.req.param('id'))
    const db = DatabaseService.getInstance(c.env)

    // 检查用户是否存在
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      const lang = getLanguage(c)
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    // 防止删除最后一个管理员
    if (existingUser.role === 'admin') {
      const admins = await db.getUsers().then(users => users.filter((u: any) => u.role === 'admin'))
      if (admins.length <= 1) {
        const lang = getLanguage(c)
        return c.json({ error: messages[lang].lastAdmin }, 400)
      }
    }

    const deletedUser = await db.deleteUser(id)

    // 不返回密码
    const { password, ...userWithoutPassword } = deletedUser

    const lang = getLanguage(c)
    return c.json({ message: messages[lang].userDeleted, user: userWithoutPassword })
  } catch (error) {
    console.error('Error deleting user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].deleteUserFailed }, 500)
  }
})

// 登录相关路由
// 登录验证器
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// 登录路由
api.post('/auth/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = await c.req.json()
    const db = DatabaseService.getInstance(c.env)
    const result = await db.validateUser(email, password)
    const lang = getLanguage(c)

    if (!result) {
      return c.json({ error: messages[lang].loginFailed }, 401)
    }

    if ('error' in result && result.error === 'account_disabled') {
      return c.json({ error: messages[lang].accountDisabled }, 403)
    }

    return c.json({
      message: messages[lang].loginSuccess,
      user: result
    })
  } catch (error) {
    console.error('Error during login:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].loginFailed }, 500)
  }
})

// 注册验证器
const registerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  secretKey: z.string().optional() // 管理员注册密钥
})

// 注册路由 - 默认注册的用户需要管理员激活
api.post('/auth/register', zValidator('json', registerSchema), async (c) => {
  try {
    const userData = await c.req.json()
    const db = DatabaseService.getInstance(c.env)
    const lang = getLanguage(c)

    // 检查是否提供了管理员密钥
    const adminSecretKey = c.env.ADMIN_SECRET_KEY || 'admin-secret-key-2025'
    const isAdmin = userData.secretKey === adminSecretKey

    // 限制公开注册，只允许管理员注册
    if (!isAdmin) {
      return c.json({ error: messages[lang].registrationDisabled }, 403)
    }

    // 检查邮箱是否已存在
    const existingUser = await db.getUserByEmail(userData.email)
    if (existingUser) {
      return c.json({ error: messages[lang].emailExists }, 400)
    }

    // 创建用户
    const { secretKey, ...userDataWithoutSecretKey } = userData
    const newUser = await db.createUser({
      ...userDataWithoutSecretKey,
      role: isAdmin ? 'admin' : 'user',
      isActive: isAdmin // 管理员账户自动激活，普通用户需要管理员激活
    })

    // 不返回密码
    const { password, ...userWithoutPassword } = newUser

    return c.json({
      message: isAdmin ? messages[lang].loginSuccess : messages[lang].registerSuccess,
      user: userWithoutPassword
    }, 201)
  } catch (error) {
    console.error('Error during registration:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].registrationFailed }, 500)
  }
})

// 管理员激活用户账户
api.post('/admin/users/:id/activate', authenticateAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = DatabaseService.getInstance(c.env)
    const lang = getLanguage(c)

    // 检查用户是否存在
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    const updatedUser = await db.activateUser(id)
    const { password, ...userWithoutPassword } = updatedUser

    return c.json({
      message: messages[lang].accountActivated,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error activating user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].activateUserFailed }, 500)
  }
})

// 管理员禁用用户账户
api.post('/admin/users/:id/deactivate', authenticateAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = DatabaseService.getInstance(c.env)
    const lang = getLanguage(c)

    // 检查用户是否存在
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      return c.json({ error: messages[lang].userNotFound }, 404)
    }

    const updatedUser = await db.deactivateUser(id)
    const { password, ...userWithoutPassword } = updatedUser

    return c.json({
      message: messages[lang].accountDeactivated,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    const lang = getLanguage(c)
    return c.json({ error: messages[lang].deactivateUserFailed }, 500)
  }
})

export default api
