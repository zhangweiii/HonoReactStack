import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/components/Notifications'
import { useTranslation } from 'react-i18next'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const { showError } = useNotifications()
  const location = useLocation()
  const { t } = useTranslation('auth')
  
  useEffect(() => {
    if (!isAuthenticated) {
      showError(t('loginRequired'), { title: t('unauthorized') })
    } else if (adminOnly && user?.role !== 'admin') {
      showError(t('adminRequired'), { title: t('unauthorized') })
    }
  }, [isAuthenticated, adminOnly, user, showError, t])
  
  if (!isAuthenticated) {
    // 重定向到登录页面，并保存当前位置
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (adminOnly && user?.role !== 'admin') {
    // 如果需要管理员权限但用户不是管理员，重定向到首页
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export default ProtectedRoute
