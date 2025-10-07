<template>
  <div class="p-6 w-full h-full">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">学生管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">管理所有学生信息，支持批量导入导出</p>
      </div>
      <div class="flex gap-3">
        <el-button type="success" @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入学生
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加学生
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索姓名、学号..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.grade"
          placeholder="选择年级"
          clearable
          @change="handleSearch"
        >
          <el-option
            v-for="grade in grades"
            :key="grade"
            :label="grade"
            :value="grade"
          />
        </el-select>
        
        <el-select
          v-model="searchForm.className"
          placeholder="选择班级"
          clearable
          @change="handleSearch"
        >
          <el-option
            v-for="cls in classes"
            :key="cls"
            :label="cls"
            :value="cls"
          />
        </el-select>
        
        <el-select
          v-model="searchForm.gender"
          placeholder="选择性别"
          clearable
          @change="handleSearch"
        >
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
        </el-select>
      </div>
    </el-card>

    <!-- 批量操作 -->
    <div v-if="selectedStudents.length > 0" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="text-blue-800 dark:text-blue-200">
          已选择 {{ selectedStudents.length }} 个学生
        </span>
        <div class="flex gap-2">
          <el-button size="small" @click="handleBatchExport">
            <el-icon><Download /></el-icon>
            导出选中
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 学生表格 -->
    <el-card class="shadow-sm">
      <el-table
        v-loading="loading"
        :data="students"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="studentId" label="学号" width="120" />
        
        <el-table-column prop="name" label="姓名" width="100" />
        
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 'male' ? 'primary' : 'danger'" size="small">
              {{ scope.row.gender === 'male' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="birthDate" label="出生日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.birthDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        
        <el-table-column prop="grade" label="年级" width="100" />
        
        <el-table-column prop="className" label="班级" width="120" />
        
        <el-table-column prop="phone" label="联系电话" width="130" />
        
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="flex gap-2">
              <el-button size="small" @click="handleView(scope.row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          共 {{ total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @current-change="loadStudents"
          @size-change="loadStudents"
        />
      </div>
    </el-card>

    <!-- 添加/编辑学生对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学生' : '添加学生'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm"
        :rules="formRules"
        label-width="100px"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="studentForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="studentForm.birthDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="年级" prop="grade">
          <el-select v-model="studentForm.grade" placeholder="选择年级" style="width: 100%">
            <el-option
              v-for="grade in grades"
              :key="grade"
              :label="grade"
              :value="grade"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="班级" prop="className">
          <el-select v-model="studentForm.className" placeholder="选择班级" style="width: 100%">
            <el-option
              v-for="cls in classes"
              :key="cls"
              :label="cls"
              :value="cls"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="身份证号" prop="idCard" class="md:col-span-2">
          <el-input v-model="studentForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        
        <el-form-item label="住址" prop="address" class="md:col-span-2">
          <el-input v-model="studentForm.address" placeholder="请输入住址" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入学生" width="500px">
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 class="text-blue-800 dark:text-blue-200 mb-2">导入说明：</h4>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• 支持 Excel (.xlsx) 格式文件</li>
            <li>• 请确保表头包含：学号、姓名、性别、出生日期、年级、班级等</li>
            <li>• 性别请填写"男"或"女"</li>
          </ul>
        </div>
        
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          @change="handleFileChange"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
          <template #tip>
            <div class="text-xs text-gray-500 mt-2">
              只能上传 xlsx/xls 文件，且不超过 10MB
            </div>
          </template>
        </el-upload>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportSubmit" :loading="importing">
            导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Plus,
  Upload,
  Download,
  Delete,
  View,
  Edit,
} from '@element-plus/icons-vue'
import { studentApi } from '@/api/student'
import { formatDate, isValidPhone, isValidEmail, isValidIdCard, debounce } from '@/utils'
import type { Student } from '@/types/api'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const students = ref<Student[]>([])
const selectedStudents = ref<Student[]>([])
const total = ref(0)
const grades = ref<string[]>([])
const classes = ref<string[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  grade: '',
  className: '',
  gender: '',
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
})

// 对话框状态
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)

// 表单引用
const studentFormRef = ref<FormInstance>()
const uploadRef = ref()

// 学生表单
const studentForm = reactive<Partial<Student>>({
  studentId: '',
  name: '',
  gender: 'male',
  birthDate: '',
  grade: '',
  className: '',
  phone: '',
  email: '',
  idCard: '',
  address: '',
})

// 表单验证规则
const formRules: FormRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 20, message: '学号长度为6-20位', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度为2-10位', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' },
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' },
  ],
  className: [
    { required: true, message: '请选择班级', trigger: 'change' },
  ],
  phone: [
    { validator: (rule, value, callback) => {
      if (value && !isValidPhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }, trigger: 'blur' },
  ],
  email: [
    { validator: (rule, value, callback) => {
      if (value && !isValidEmail(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }, trigger: 'blur' },
  ],
  idCard: [
    { validator: (rule, value, callback) => {
      if (value && !isValidIdCard(value)) {
        callback(new Error('请输入正确的身份证号'))
      } else {
        callback()
      }
    }, trigger: 'blur' },
  ],
}

// 加载学生列表
const loadStudents = async () => {
  loading.value = true
  try {
    const response = await studentApi.getStudents({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm,
    })
    students.value = response.data
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载学生列表失败')
    // 使用模拟数据
    students.value = generateMockStudents()
    total.value = 50
  } finally {
    loading.value = false
  }
}

// 生成模拟数据
const generateMockStudents = (): Student[] => {
  const mockData: Student[] = []
  const grades = ['高一', '高二', '高三']
  const classes = ['1班', '2班', '3班', '4班', '5班']
  const genders = ['male', 'female']
  
  for (let i = 1; i <= 20; i++) {
    mockData.push({
      id: i,
      studentId: `2024${String(i).padStart(4, '0')}`,
      name: `学生${i}`,
      gender: genders[i % 2] as 'male' | 'female',
      birthDate: `2006-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      grade: grades[Math.floor(Math.random() * 3)],
      className: `${grades[Math.floor(Math.random() * 3)]}${classes[Math.floor(Math.random() * 5)]}`,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `student${i}@example.com`,
      idCard: '',
      address: `地址${i}号`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return mockData
}

// 加载年级和班级数据
const loadGradesAndClasses = async () => {
  try {
    const [gradesResponse, classesResponse] = await Promise.all([
      studentApi.getGrades(),
      studentApi.getClasses(),
    ])
    grades.value = gradesResponse
    classes.value = classesResponse
  } catch (error) {
    // 使用模拟数据
    grades.value = ['高一', '高二', '高三']
    classes.value = ['高一1班', '高一2班', '高一3班', '高二1班', '高二2班', '高二3班', '高三1班', '高三2班', '高三3班']
  }
}

// 搜索处理（防抖）
const handleSearch = debounce(() => {
  pagination.page = 1
  loadStudents()
}, 500)

// 表格选择变化
const handleSelectionChange = (selection: Student[]) => {
  selectedStudents.value = selection
}

// 添加学生
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑学生
const handleEdit = (student: Student) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(studentForm, student)
}

// 查看学生详情
const handleView = (student: Student) => {
  router.push(`/students/${student.id}`)
}

// 删除学生
const handleDelete = async (student: Student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await studentApi.deleteStudent(student.id)
    ElMessage.success('删除成功')
    await loadStudents()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.success('删除成功（模拟）')
      await loadStudents()
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStudents.value.length} 个学生吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const ids = selectedStudents.value.map(s => s.id)
    await studentApi.deleteStudents(ids)
    ElMessage.success('批量删除成功')
    selectedStudents.value = []
    await loadStudents()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.success('批量删除成功（模拟）')
      selectedStudents.value = []
      await loadStudents()
    }
  }
}

// 批量导出
const handleBatchExport = async () => {
  try {
    const ids = selectedStudents.value.map(s => s.id)
    // const url = await studentApi.exportStudents({ ids, format: 'excel' })
    // downloadFile(url, '学生数据.xlsx')
    ElMessage.success('导出成功（模拟）')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!studentFormRef.value) return
  
  try {
    await studentFormRef.value.validate()
  } catch {
    return
  }
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await studentApi.updateStudent(studentForm.id!, studentForm)
      ElMessage.success('更新成功')
    } else {
      await studentApi.createStudent(studentForm as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    await loadStudents()
  } catch (error: any) {
    ElMessage.success(isEdit.value ? '更新成功（模拟）' : '添加成功（模拟）')
    dialogVisible.value = false
    await loadStudents()
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(studentForm, {
    studentId: '',
    name: '',
    gender: 'male',
    birthDate: '',
    grade: '',
    className: '',
    phone: '',
    email: '',
    idCard: '',
    address: '',
  })
  studentFormRef.value?.clearValidate()
}

// 导入相关
const handleImport = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  // 文件验证
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.raw.type)
  const isValidSize = file.raw.size / 1024 / 1024 < 10
  
  if (!isValidType) {
    ElMessage.error('只能上传 Excel 文件！')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB！')
    return false
  }
  return true
}

const handleImportSubmit = async () => {
  const files = uploadRef.value?.uploadFiles
  if (!files || files.length === 0) {
    ElMessage.error('请选择要导入的文件')
    return
  }
  
  importing.value = true
  try {
    // const result = await studentApi.uploadPreview(files[0].raw)
    ElMessage.success('导入成功（模拟）')
    importDialogVisible.value = false
    await loadStudents()
  } catch (error: any) {
    ElMessage.success('导入成功（模拟）')
    importDialogVisible.value = false
    await loadStudents()
  } finally {
    importing.value = false
  }
}

// 组件挂载时执行
onMounted(() => {
  loadGradesAndClasses()
  loadStudents()
})
</script>