import type { UserRole, UserStatus } from './user'
import type { ApiResponse } from './api'
import type { User } from './user'

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

// 登录数据结构
export interface LoginData {
  accessToken: string
  expires_in: number
  user: UserProfile
}

// 刷新数据结构
export interface RefreshData {
  accessToken: string
  expires_in: number
}

// 登出数据结构
export interface LogoutData {
  success: boolean
}

// 登录响应
export type LoginResponse = ApiResponse<LoginData>

// 刷新令牌响应
export type RefreshResponse = ApiResponse<RefreshData>

// 登出响应
export type LogoutResponse = ApiResponse<LogoutData>

// 验证 Token 响应（204 No Content，无数据返回）
export type VerifyTokenResponse = void

// 获取当前用户信息响应
export type GetCurrentUserResponse = ApiResponse<User>

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
