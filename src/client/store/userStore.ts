import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  // 状态
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
  
  // 动作
  fetchUsers: () => Promise<void>
  selectUser: (userId: number) => void
  clearSelectedUser: () => void
  addUser: (user: Omit<User, 'id'>) => Promise<void>
  updateUser: (id: number, updates: Partial<User>) => Promise<void>
  deleteUser: (id: number) => Promise<void>
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        users: [],
        selectedUser: null,
        isLoading: false,
        error: null,
        
        // 动作实现
        fetchUsers: async () => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch('/api/users')
            if (!response.ok) {
              throw new Error(`获取用户失败: ${response.status}`)
            }
            const users = await response.json() as User[]
            set({ users, isLoading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '获取用户时发生未知错误', 
              isLoading: false 
            })
          }
        },
        
        selectUser: (userId: number) => {
          const { users } = get()
          const user = users.find(u => u.id === userId) || null
          set({ selectedUser: user })
        },
        
        clearSelectedUser: () => {
          set({ selectedUser: null })
        },
        
        addUser: async (userData) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            })
            
            if (!response.ok) {
              throw new Error(`添加用户失败: ${response.status}`)
            }
            
            const newUser = await response.json() as User
            set(state => ({ 
              users: [...state.users, newUser],
              isLoading: false 
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '添加用户时发生未知错误', 
              isLoading: false 
            })
          }
        },
        
        updateUser: async (id, updates) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch(`/api/users/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            })
            
            if (!response.ok) {
              throw new Error(`更新用户失败: ${response.status}`)
            }
            
            const updatedUser = await response.json() as User
            set(state => ({ 
              users: state.users.map(user => user.id === id ? updatedUser : user),
              selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
              isLoading: false 
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '更新用户时发生未知错误', 
              isLoading: false 
            })
          }
        },
        
        deleteUser: async (id) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch(`/api/users/${id}`, {
              method: 'DELETE'
            })
            
            if (!response.ok) {
              throw new Error(`删除用户失败: ${response.status}`)
            }
            
            set(state => ({ 
              users: state.users.filter(user => user.id !== id),
              selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
              isLoading: false 
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '删除用户时发生未知错误', 
              isLoading: false 
            })
          }
        }
      }),
      {
        name: 'user-storage', // localStorage 中的键名
        partialize: (state) => ({ users: state.users }), // 只持久化 users 数组
      }
    )
  )
)
