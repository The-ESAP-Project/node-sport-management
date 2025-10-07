import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/api'
import { TOKEN_KEY } from '@/utils/api'

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const token = ref<string>('')
    const userInfo = ref<User | null>(null)
    const permissions = ref<string[]>([])

    // 计算属性
    const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
    const isAdmin = computed(() => userInfo.value?.role === 'admin')
    const isClassTeacher = computed(() => userInfo.value?.role === 'class')

    // 方法
    const setToken = (newToken: string) => {
      token.value = newToken
      localStorage.setItem(TOKEN_KEY, newToken)
    }

    const setUserInfo = (user: User) => {
      userInfo.value = user
      permissions.value = user.permissions || []
    }

    const hasPermission = (permission: string): boolean => {
      if (isAdmin.value) return true
      return permissions.value.includes(permission)
    }

    const hasAnyPermission = (permissionList: string[]): boolean => {
      if (isAdmin.value) return true
      return permissionList.some(permission => permissions.value.includes(permission))
    }

    const logout = () => {
      token.value = ''
      userInfo.value = null
      permissions.value = []
      localStorage.removeItem(TOKEN_KEY)
    }

    const initFromStorage = () => {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      if (savedToken) {
        token.value = savedToken
      }
    }

    return {
      // 状态
      token,
      userInfo,
      permissions,
      // 计算属性
      isLoggedIn,
      isAdmin,
      isClassTeacher,
      // 方法
      setToken,
      setUserInfo,
      hasPermission,
      hasAnyPermission,
      logout,
      initFromStorage,
    }
  },
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
      paths: ['userInfo'],
    },
  }
)