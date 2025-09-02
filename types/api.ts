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
