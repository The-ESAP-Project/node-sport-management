import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SystemConfig } from '@/types/api'

export const useSystemStore = defineStore(
  'system',
  () => {
    // 状态
    const config = ref<SystemConfig | null>(null)
    const loading = ref(false)
    const theme = ref<'light' | 'dark'>('light')
    const sidebarCollapsed = ref(false)

    // 方法
    const setConfig = (newConfig: SystemConfig) => {
      config.value = newConfig
    }

    const setLoading = (isLoading: boolean) => {
      loading.value = isLoading
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      
      // 更新 document class
      const html = document.documentElement
      if (theme.value === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }

    const setTheme = (newTheme: 'light' | 'dark') => {
      theme.value = newTheme
      
      // 更新 document class
      const html = document.documentElement
      if (newTheme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const setSidebarCollapsed = (collapsed: boolean) => {
      sidebarCollapsed.value = collapsed
    }

    // 初始化主题
    const initTheme = () => {
      // 从本地存储读取主题设置，如果没有则使用系统偏好
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme)
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    }

    return {
      // 状态
      config,
      loading,
      theme,
      sidebarCollapsed,
      // 方法
      setConfig,
      setLoading,
      toggleTheme,
      setTheme,
      toggleSidebar,
      setSidebarCollapsed,
      initTheme,
    }
  },
  {
    persist: {
      key: 'system-store',
      storage: localStorage,
      paths: ['theme', 'sidebarCollapsed'],
    },
  }
)