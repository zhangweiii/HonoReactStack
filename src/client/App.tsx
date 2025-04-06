import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/globals.css'

import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // 打印调试信息，查看认证状态
  useEffect(() => {
    console.log('App - isAuthenticated:', isAuthenticated);
    console.log('App - user:', user);
  }, [isAuthenticated, user]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  )
}

export default App
