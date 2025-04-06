import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import i18next from 'i18next'

export interface User {
  id: number
  name?: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
}

interface AuthState {
  // 状态
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 动作
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string, secretKey?: string) => Promise<{ success: boolean }>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // 登录
        login: async (email, password) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })

            const data = await response.json() as any

            if (!response.ok) {
              throw new Error(data.error || i18next.t('auth:loginFailed', '登录失败'))
            }

            // 设置 cookie 以便后端可以识别用户
            document.cookie = `userId=${data.user.id}; path=/; max-age=86400; SameSite=Strict`

            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : i18next.t('auth:loginFailed', '登录失败'),
              isLoading: false,
              isAuthenticated: false,
              user: null
            })
          }
        },

        // 注册
        register: async (email, password, name, secretKey) => {
          set({ isLoading: true, error: null })
          try {
            const userData: any = { email, password }
            if (name) userData.name = name
            if (secretKey) userData.secretKey = secretKey

            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            })

            const data = await response.json() as any

            if (!response.ok) {
              set({
                error: data.error || i18next.t('auth:registrationFailed', '注册失败'),
                isLoading: false
              })
              return { success: false }
            }

            // 如果是管理员注册，自动登录
            if (data.user.role === 'admin' && data.user.isActive) {
              // 设置 cookie 以便后端可以识别用户
              document.cookie = `userId=${data.user.id}; path=/; max-age=86400; SameSite=Strict`

              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false
              })
            } else {
              // 普通用户注册成功但需要激活
              set({
                isLoading: false,
                error: null
              })
            }

            return { success: true }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : i18next.t('auth:registrationFailed', '注册失败'),
              isLoading: false
            })
            return { success: false }
          }
        },

        // 登出
        logout: () => {
          // 清除 cookie
          document.cookie = 'userId=; path=/; max-age=0; SameSite=Strict'

          set({
            user: null,
            isAuthenticated: false,
            error: null
          })
        },

        // 清除错误
        clearError: () => {
          set({ error: null })
        }
      }),
      {
        // 初始化时检查并恢复认证状态
        onRehydrateStorage: () => {
          // 在存储恢复前打印当前状态
          console.log('Auth store before rehydration - document.cookie:', document.cookie);

          return (newState) => {
            // 在存储恢复后打印状态
            console.log('Auth store rehydrated:', newState);

            if (newState) {
              // 如果有用户数据但 isAuthenticated 为 false，尝试修复
              if (newState.user && !newState.isAuthenticated) {
                console.log('Fixing inconsistent auth state: user exists but not authenticated');
                // 强制设置为已认证状态
                setTimeout(() => {
                  useAuthStore.setState({ isAuthenticated: true });
                }, 0);
              }

              // 确保 cookie 与用户 ID 一致
              if (newState.user) {
                const cookies = document.cookie.split('; ');
                const userIdCookie = cookies.find(cookie => cookie.startsWith('userId='));

                if (!userIdCookie) {
                  console.log('Restoring userId cookie for user:', newState.user.id);
                  // 如果没有 cookie，重新设置
                  document.cookie = `userId=${newState.user.id}; path=/; max-age=86400; SameSite=Strict`;
                }
              }
            }
          };
        },
        name: 'auth-storage', // localStorage 中的键名
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        }), // 只持久化用户信息和认证状态
      }
    )
  )
)
