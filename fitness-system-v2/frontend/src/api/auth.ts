import apiClient from '@/utils/api'
import type { 
  LoginForm, 
  LoginResponse, 
  ApiResponse, 
  User 
} from '@/types/api'

export const authApi = {
  // 用户登录
  async login(loginForm: LoginForm): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', loginForm)
    return response.data.data!
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data.data!
  },

  // 用户登出
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  // 刷新 token
  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh')
    return response.data.data!
  },

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/password', {
      oldPassword,
      newPassword,
    })
  },

  // 验证 token 有效性
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/validate')
      return true
    } catch {
      return false
    }
  },
}