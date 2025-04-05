import { Context } from 'hono'
import { Env } from './services/db'

// 用户类型
export interface User {
  id: number
  email: string
  name?: string | null
  password: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 扩展 Hono 上下文类型
declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}
