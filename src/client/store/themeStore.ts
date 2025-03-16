import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  // 状态
  theme: Theme
  
  // 动作
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 初始状态
      theme: 'system',
      
      // 动作实现
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => {
        const { theme } = get()
        if (theme === 'light') {
          set({ theme: 'dark' })
        } else if (theme === 'dark') {
          set({ theme: 'system' })
        } else {
          set({ theme: 'light' })
        }
      }
    }),
    {
      name: 'theme-storage', // localStorage 中的键名
    }
  )
)
