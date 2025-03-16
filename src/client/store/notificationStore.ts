import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  title?: string
  duration?: number // 毫秒，默认 5000ms
}

interface NotificationState {
  // 状态
  notifications: Notification[]
  
  // 动作
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9)

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      // 初始状态
      notifications: [],
      
      // 动作实现
      addNotification: (notification) => {
        const id = generateId()
        const newNotification = {
          id,
          duration: 5000, // 默认显示 5 秒
          ...notification
        }
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }))
        
        // 如果设置了持续时间，则自动移除通知
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            set(state => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }))
          }, newNotification.duration)
        }
        
        return id
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },
      
      clearAllNotifications: () => {
        set({ notifications: [] })
      }
    })
  )
)
