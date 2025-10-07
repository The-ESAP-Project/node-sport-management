import axios from 'axios'
import type { ApiResponse } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    
    // 如果响应格式不符合 ApiResponse，直接返回原数据
    if (typeof data !== 'object' || !('success' in data)) {
      return response
    }
    
    // 如果 API 返回失败
    if (!data.success) {
      const error = new Error(data.message || '请求失败')
      error.name = 'ApiError'
      return Promise.reject(error)
    }
    
    return response
  },
  (error) => {
    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as ApiResponse
      
      switch (status) {
        case 401:
          // 清除 token 并重定向到登录页
          localStorage.removeItem(TOKEN_KEY)
          window.location.href = '/login'
          break
        case 403:
          // 权限不足
          break
        case 404:
          // 接口不存在
          break
        case 500:
          // 服务器错误
          break
      }
      
      const message = data?.message || `HTTP ${status} 错误`
      const apiError = new Error(message)
      apiError.name = 'HttpError'
      return Promise.reject(apiError)
    }
    
    // 网络错误
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      const networkError = new Error('网络连接失败，请检查网络设置')
      networkError.name = 'NetworkError'
      return Promise.reject(networkError)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
export { API_BASE_URL, TOKEN_KEY }