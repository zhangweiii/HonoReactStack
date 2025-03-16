import { useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/themeStore'
import { useNotifications } from '@/components/Notifications'

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore()
  const { showInfo } = useNotifications()
  
  // 在组件挂载时应用主题
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement
      
      // 移除所有主题类
      root.classList.remove('light', 'dark')
      
      // 应用选择的主题
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
    
    applyTheme()
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
  
  const handleToggle = () => {
    toggleTheme()
    
    // 显示通知
    const newTheme = theme === 'light' ? '深色' : theme === 'dark' ? '系统' : '浅色'
    showInfo(`已切换到${newTheme}主题`, { title: '主题已更改' })
  }
  
  return (
    <Button variant="outline" size="icon" onClick={handleToggle} title={`当前主题: ${theme}`}>
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'dark' && <Moon className="h-5 w-5" />}
      {theme === 'system' && <Monitor className="h-5 w-5" />}
    </Button>
  )
}
