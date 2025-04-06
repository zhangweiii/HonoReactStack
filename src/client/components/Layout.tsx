import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { Notifications } from './Notifications'
import LanguageSelector from '../i18n/LanguageSelector'
import { Menu, X, User, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from './Notifications'

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation('common')
  const { isAuthenticated, user, logout } = useAuthStore()

  // 打印导航栏中的认证状态
  console.log('Layout - Auth state:', { isAuthenticated, user })
  const { showSuccess } = useNotifications()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    showSuccess(t('logoutSuccess'), { title: t('success') })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{t('appTitle')}</h1>
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
              {isAuthenticated && (
                <Link to="/users" className="hover:text-primary transition-colors">{t('nav.users')}</Link>
              )}
              <Link to="/about" className="hover:text-primary transition-colors">{t('nav.about')}</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <ThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name || user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('nav.login')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('nav.register')}
                </Button>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={toggleMenu}
              aria-label={t('nav.menu')}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <nav className="container mx-auto px-4 py-2 flex flex-col">
            <Link
              to="/"
              className="py-3 border-b border-border hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/users"
                className="py-3 border-b border-border hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.users')}
              </Link>
            )}
            <Link
              to="/about"
              className="py-3 border-b border-border hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>

            {isAuthenticated ? (
              <button
                className="py-3 text-left text-destructive hover:text-destructive/80 transition-colors"
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 border-b border-border hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="py-3 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* 主要内容 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p> {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </footer>

      {/* 通知系统 */}
      <Notifications />
    </div>
  )
}

export default Layout
