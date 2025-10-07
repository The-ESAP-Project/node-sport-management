import apiClient from '@/utils/api'
import type { 
  Student, 
  StudentUploadData,
  UploadPreviewResponse,
  ApiResponse, 
  PaginationResponse 
} from '@/types/api'

export const studentApi = {
  // 获取学生列表
  async getStudents(params: {
    page?: number
    limit?: number
    className?: string
    grade?: string
    keyword?: string
  } = {}): Promise<PaginationResponse<Student>> {
    const response = await apiClient.get<ApiResponse<PaginationResponse<Student>>>('/students', {
      params,
    })
    return response.data.data!
  },

  // 获取学生详情
  async getStudent(id: number): Promise<Student> {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`)
    return response.data.data!
  },

  // 创建学生
  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const response = await apiClient.post<ApiResponse<Student>>('/students', student)
    return response.data.data!
  },

  // 更新学生信息
  async updateStudent(id: number, student: Partial<Student>): Promise<Student> {
    const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, student)
    return response.data.data!
  },

  // 删除学生
  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`)
  },

  // 批量删除学生
  async deleteStudents(ids: number[]): Promise<void> {
    await apiClient.delete('/students/batch', {
      data: { ids },
    })
  },

  // 上传学生数据预览
  async uploadPreview(file: File): Promise<UploadPreviewResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<ApiResponse<UploadPreviewResponse>>(
      '/students/upload/preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!
  },

  // 确认上传学生数据
  async confirmUpload(previewId: string): Promise<{ 
    success: number
    failed: number 
  }> {
    const response = await apiClient.post<ApiResponse<{ 
      success: number
      failed: number 
    }>>('/students/upload/confirm', {
      previewId,
    })
    return response.data.data!
  },

  // 获取班级列表
  async getClasses(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/students/classes')
    return response.data.data!
  },

  // 获取年级列表
  async getGrades(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/students/grades')
    return response.data.data!
  },

  // 导出学生数据
  async exportStudents(params: {
    className?: string
    grade?: string
    format: 'excel' | 'csv'
  }): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ downloadUrl: string }>>(
      '/students/export',
      params
    )
    return response.data.data!.downloadUrl
  },
}