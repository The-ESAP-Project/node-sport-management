// API 相关通用类型定义

// API 分页请求参数
export interface PaginationQuery {
  page?: number
  size?: number
}

// API 分页响应结构
export interface PaginationInfo {
  page: number
  size: number
  total: number
  pages: number
}

// API 响应基础接口
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: string
}

// 错误响应接口
export interface ApiError {
  code: number
  message: string
  timestamp: string
}
