import apiClient from '@/utils/api'
import type { 
  StudentScore,
  StudentDetail,
  ApiResponse, 
  PaginationResponse 
} from '@/types/api'

export const scoreApi = {
  // 获取学生成绩列表
  async getScores(params: {
    page?: number
    limit?: number
    className?: string
    grade?: string
    year?: number
    keyword?: string
  } = {}): Promise<PaginationResponse<StudentScore>> {
    const response = await apiClient.get<ApiResponse<PaginationResponse<StudentScore>>>('/scores', {
      params,
    })
    return response.data.data!
  },

  // 获取学生成绩详情
  async getStudentScore(studentId: number, year?: number): Promise<StudentDetail> {
    const response = await apiClient.get<ApiResponse<StudentDetail>>(`/scores/student/${studentId}`, {
      params: { year },
    })
    return response.data.data!
  },

  // 录入/更新学生成绩
  async updateScore(studentId: number, data: {
    height?: number
    weight?: number
    vitalCapacity?: number
    run50m?: number
    longJump?: number
    sitAndReach?: number
    longRun?: number
    strengthTest?: number
    year?: number
  }): Promise<StudentScore> {
    const response = await apiClient.put<ApiResponse<StudentScore>>(`/scores/student/${studentId}`, data)
    return response.data.data!
  },

  // 批量导入成绩
  async importScores(file: File): Promise<{
    success: number
    failed: number
    errors?: Array<{ row: number; errors: string[] }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<ApiResponse<{
      success: number
      failed: number
      errors?: Array<{ row: number; errors: string[] }>
    }>>(
      '/scores/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!
  },

  // 重新计算成绩
  async recalculateScores(params: {
    className?: string
    grade?: string
    year?: number
  } = {}): Promise<{ affected: number }> {
    const response = await apiClient.post<ApiResponse<{ affected: number }>>(
      '/scores/recalculate',
      params
    )
    return response.data.data!
  },

  // 导出成绩
  async exportScores(params: {
    className?: string
    grade?: string
    year?: number
    format: 'excel' | 'pdf'
    includeDetails?: boolean
  }): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ downloadUrl: string }>>(
      '/scores/export',
      params
    )
    return response.data.data!.downloadUrl
  },

  // 获取成绩统计
  async getScoreStats(params: {
    className?: string
    grade?: string
    year?: number
  } = {}): Promise<{
    totalStudents: number
    avgScore: number
    maxScore: number
    minScore: number
    passRate: number
    distribution: Array<{ range: string; count: number }>
  }> {
    const response = await apiClient.get<ApiResponse<{
      totalStudents: number
      avgScore: number
      maxScore: number
      minScore: number
      passRate: number
      distribution: Array<{ range: string; count: number }>
    }>>('/scores/stats', {
      params,
    })
    return response.data.data!
  },
}