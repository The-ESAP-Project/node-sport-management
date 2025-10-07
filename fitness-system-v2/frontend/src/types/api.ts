// API相关类型定义

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 用户相关类型
export interface User {
  id: number
  username: string
  role: 'admin' | 'class'
  nickname?: string
  className?: string
  grade?: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

// 学生相关类型
export interface Student {
  id: number
  name: string
  gender: 'male' | 'female'
  className: string
  grade: string
  hasData: boolean
  createdAt: string
  updatedAt: string
}

export interface StudentUploadData extends Student {
  height?: number
  weight?: number
  vitalCapacity?: number
  run50m?: number
  longJump?: number
  sitAndReach?: number
  longRun?: number
  strengthTest?: number
}

export interface UploadPreviewResponse {
  previewId: string
  summary: {
    totalRows: number
    validRows: number
    errorRows: number
    className: string
  }
  preview: (StudentUploadData & { row: number; errors: string[] })[]
  errors: Array<{ row: number; errors: string[] }>
}

// 评分标准类型
export interface ScoreRange {
  min: number
  max: number | null
  score: number
}

export interface StandardRule {
  item: string
  itemName: string
  gender: 'male' | 'female'
  unit: string
  weight: number
  direction: 'higher_better' | 'lower_better'
  ranges: ScoreRange[]
}

export interface EvaluationStandard {
  id: number
  name: string
  year: number
  version: string
  isActive: boolean
  items: StandardRule[]
  createdAt: string
  updatedAt: string
}

// 成绩相关类型
export interface ScoreItem {
  item: string
  itemName: string
  rawValue: number
  score: number
  unit: string
  percentile?: number
}

export interface StudentScore {
  studentId: number
  studentName: string
  className: string
  year: number
  totalScore: number
  classRank: number
  gradeRank: number
  items: ScoreItem[]
  updatedAt: string
}

export interface StudentDetail {
  student: Student
  currentYear: {
    year: number
    totalScore: number
    classRank: number
    gradeRank: number
    items: ScoreItem[]
  }
  history: Array<{
    year: number
    totalScore: number
    classRank: number
    gradeRank: number
  }>
}

// 分析相关类型
export interface AnalysisOverview {
  scope: 'class' | 'grade' | 'school'
  target: string
  year: number
  summary: {
    totalStudents: number
    avgScore: number
    maxScore: number
    minScore: number
    passRate: number
  }
  distribution: Array<{
    range: string
    count: number
  }>
}

export interface TrendData {
  trends: {
    years: number[]
    avgScores: number[]
    passRates: number[]
  }
  itemTrends: Array<{
    item: string
    itemName: string
    data: number[]
  }>
}

export interface RankingData {
  rankings: Array<{
    rank: number
    studentName: string
    className: string
    totalScore: number
  }>
  classRankings: Array<{
    rank: number
    className: string
    avgScore: number
    studentCount: number
  }>
}

// 系统配置类型
export interface SystemConfig {
  uploadDeadline: string
  currentYear: number
  activeStandardId: number
  systemStatus: 'normal' | 'maintenance'
}

// 导出类型
export interface ExportRequest {
  scope: 'class' | 'grade' | 'school'
  target: string
  year: number
  format: 'excel' | 'pdf'
  includeDetails: boolean
}

export interface ExportResponse {
  downloadUrl: string
  expiresAt: string
}