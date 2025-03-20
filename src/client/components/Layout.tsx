import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { Notifications } from './Notifications'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Hono + React 示例</h1>
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-primary transition-colors">首页</Link>
              <Link to="/users" className="hover:text-primary transition-colors">用户</Link>
              <Link to="/about" className="hover:text-primary transition-colors">关于</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={toggleMenu}
              aria-label="菜单"
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
              首页
            </Link>
            <Link
              to="/users"
              className="py-3 border-b border-border hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              用户
            </Link>
            <Link
              to="/about"
              className="py-3 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              关于
            </Link>
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
          <p> {new Date().getFullYear()} Hono + React 示例项目</p>
        </div>
      </footer>

      {/* 通知系统 */}
      <Notifications />
    </div>
  )
}

export default Layout
