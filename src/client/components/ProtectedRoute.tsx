import { ReactNode, useEffect, useRef } from 'react'
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

  // 打印调试信息，查看认证状态
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);

  // 如果有用户但未认证，尝试修复状态
  useEffect(() => {
    if (user && !isAuthenticated) {
      console.log('ProtectedRoute - Fixing inconsistent auth state');
      // 强制设置为已认证状态
      useAuthStore.setState({ isAuthenticated: true });
    }
  }, [user, isAuthenticated]);

  // 使用 useRef 跟踪是否已显示错误消息
  const hasShownErrorRef = useRef(false);

  // 如果用户未登录，显示错误消息
  useEffect(() => {
    if (!isAuthenticated && !hasShownErrorRef.current) {
      showError(t('loginRequired'), { title: t('unauthorized') });
      hasShownErrorRef.current = true;
    }
  }, [isAuthenticated, showError, t]);

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
