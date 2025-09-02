import type { UserRole, UserStatus } from './user'

// 认证相关类型定义

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 用户档案（用于登录响应）
export interface UserProfile {
  id: number
  username: string
  name?: string
  role: UserRole
  status: UserStatus
}

// 登录响应
export interface LoginResponse {
  accessToken: string
  expires_in: number
  user: UserProfile
}

// 刷新令牌响应
export interface RefreshResponse {
  accessToken: string
  expires_in: number
}

// 登出响应
export interface LogoutResponse {
  success: boolean
}

// JWT Payload 类型
export interface JWTPayload {
  id: number
  username: string
  role: UserRole
  type: 'access' | 'refresh'
}

// Refresh Token 在数据库中的存储格式
export interface RefreshTokenRecord {
  id: number
  userId: number
  token: string
  expiresAt: Date
  createdAt: Date
}
