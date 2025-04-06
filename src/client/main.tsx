import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
// 导入 i18n 配置
import './i18n'
// 导入认证存储
import { useAuthStore } from './store/authStore'

// 初始化函数
const InitializeApp = () => {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    // 在应用启动时打印认证状态
    console.log('App initialized - Auth state:', { isAuthenticated, user })

    // 如果有用户但未认证，尝试修复状态
    if (user && !isAuthenticated) {
      console.log('Fixing auth state on app init')
      useAuthStore.setState({ isAuthenticated: true })
    }
  }, [isAuthenticated, user])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <InitializeApp />
    </BrowserRouter>
  </React.StrictMode>
)
