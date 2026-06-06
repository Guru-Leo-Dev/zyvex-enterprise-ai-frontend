import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = [
  { id: 'light', label: 'Light', icon: '☀️', description: 'Clean and minimal' },
  { id: 'dark', label: 'Dark', icon: '🌑', description: 'Easy on the eyes' },
  { id: 'midnight', label: 'Midnight', icon: '🌌', description: 'Deep space aesthetic' },
  { id: 'aurora', label: 'Aurora', icon: '🌊', description: 'Oceanic bioluminescence' },
]

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
      initTheme: () => {
        const stored = useThemeStore.getState().theme
        document.documentElement.setAttribute('data-theme', stored)
      },
    }),
    { name: 'zyvex-theme' }
  )
)

export default useThemeStore
