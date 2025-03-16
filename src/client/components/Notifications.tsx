import { useEffect, useState } from 'react'
import { useNotificationStore, type NotificationType } from '@/store/notificationStore'
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from '@/components/ui/toast'

// 将通知类型映射到 Toast 变体
const mapTypeToVariant = (type: NotificationType) => {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'destructive'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'default'
  }
}

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore()
  
  return (
    <ToastProvider>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={mapTypeToVariant(notification.type) as any}
          onOpenChange={(open) => {
            if (!open) removeNotification(notification.id)
          }}
        >
          {notification.title && <ToastTitle>{notification.title}</ToastTitle>}
          <ToastDescription>{notification.message}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

// 创建一个简单的钩子来使用通知
export function useNotifications() {
  const { addNotification, removeNotification, clearAllNotifications } = useNotificationStore()
  
  return {
    showNotification: addNotification,
    hideNotification: removeNotification,
    clearNotifications: clearAllNotifications,
    
    // 便捷方法
    showSuccess: (message: string, options?: { title?: string, duration?: number }) => 
      addNotification({ type: 'success', message, ...options }),
    
    showError: (message: string, options?: { title?: string, duration?: number }) => 
      addNotification({ type: 'error', message, ...options }),
    
    showWarning: (message: string, options?: { title?: string, duration?: number }) => 
      addNotification({ type: 'warning', message, ...options }),
    
    showInfo: (message: string, options?: { title?: string, duration?: number }) => 
      addNotification({ type: 'info', message, ...options })
  }
}
