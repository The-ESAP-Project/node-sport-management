<template>
  <div class="w-full p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">成绩录入</h1>
          <p class="text-gray-600 mt-1">录入或更新学生体测成绩</p>
        </div>
        <el-button @click="$router.back()">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 学生选择 -->
    <el-card class="mb-6" v-if="!selectedStudent">
      <template #header>
        <span>选择学生</span>
      </template>
      
      <div class="space-y-4">
        <!-- 筛选条件 -->
        <el-form :model="studentFilters" :inline="true">
          <el-form-item label="年级">
            <el-select v-model="studentFilters.grade" placeholder="选择年级" clearable>
              <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="studentFilters.className" placeholder="选择班级" clearable>
              <el-option v-for="cls in classOptions" :key="cls" :label="cls" :value="cls" />
            </el-select>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="studentFilters.keyword"
              placeholder="搜索学生姓名"
              clearable
              @keyup.enter="searchStudents"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStudents">搜索</el-button>
          </el-form-item>
        </el-form>

        <!-- 学生列表 -->
        <el-table
          v-loading="studentLoading"
          :data="students"
          @row-click="selectStudent"
          highlight-current-row
          style="cursor: pointer"
        >
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="className" label="班级" width="120" />
          <el-table-column prop="grade" label="年级" width="100" />
          <el-table-column prop="gender" label="性别" width="100">
            <template #default="{ row }">
              {{ row.gender === 'male' ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="hasData" label="已录入数据" width="120">
            <template #default="{ row }">
              <el-tag :type="row.hasData ? 'success' : 'info'">
                {{ row.hasData ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-center">
          <el-pagination
            v-model:current-page="studentPagination.page"
            v-model:page-size="studentPagination.limit"
            :page-sizes="[10, 20, 50]"
            :total="studentPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleStudentSizeChange"
            @current-change="handleStudentCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 成绩录入表单 -->
    <el-card v-if="selectedStudent">
      <template #header>
        <div class="flex justify-between items-center">
          <span>成绩录入 - {{ selectedStudent.name }}</span>
          <el-button type="text" @click="changeStudent">
            <el-icon><Switch /></el-icon>
            更换学生
          </el-button>
        </div>
      </template>

      <!-- 学生信息 -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-gray-600">姓名：</span>
            <span class="font-medium">{{ selectedStudent.name }}</span>
          </div>
          <div>
            <span class="text-gray-600">性别：</span>
            <span class="font-medium">{{ selectedStudent.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div>
            <span class="text-gray-600">班级：</span>
            <span class="font-medium">{{ selectedStudent.className }}</span>
          </div>
          <div>
            <span class="text-gray-600">年级：</span>
            <span class="font-medium">{{ selectedStudent.grade }}</span>
          </div>
        </div>
      </div>

      <!-- 成绩表单 -->
      <el-form
        ref="scoreFormRef"
        :model="scoreForm"
        :rules="scoreRules"
        label-width="120px"
        class="max-w-4xl"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 基础测量 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">基础测量</h3>
            
            <el-form-item label="身高 (cm)" prop="height">
              <el-input-number
                v-model="scoreForm.height"
                :min="100"
                :max="250"
                :precision="1"
                :step="0.1"
                placeholder="请输入身高"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="体重 (kg)" prop="weight">
              <el-input-number
                v-model="scoreForm.weight"
                :min="20"
                :max="200"
                :precision="1"
                :step="0.1"
                placeholder="请输入体重"
                class="w-full"
              />
            </el-form-item>

            <!-- BMI显示 -->
            <div v-if="bmi" class="bg-blue-50 p-3 rounded">
              <div class="text-sm text-gray-600">BMI指数</div>
              <div class="text-lg font-bold" :class="getBmiClass(bmi)">
                {{ bmi.toFixed(1) }} ({{ getBmiLabel(bmi) }})
              </div>
            </div>
          </div>

          <!-- 肺活量 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">肺活量</h3>
            
            <el-form-item label="肺活量 (ml)" prop="vitalCapacity">
              <el-input-number
                v-model="scoreForm.vitalCapacity"
                :min="1000"
                :max="8000"
                :step="50"
                placeholder="请输入肺活量"
                class="w-full"
              />
            </el-form-item>
          </div>

          <!-- 速度类项目 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">速度测试</h3>
            
            <el-form-item label="50米跑 (秒)" prop="run50m">
              <el-input-number
                v-model="scoreForm.run50m"
                :min="5"
                :max="15"
                :precision="2"
                :step="0.01"
                placeholder="请输入50米跑成绩"
                class="w-full"
              />
            </el-form-item>
          </div>

          <!-- 力量类项目 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">力量测试</h3>
            
            <el-form-item label="立定跳远 (cm)" prop="longJump">
              <el-input-number
                v-model="scoreForm.longJump"
                :min="100"
                :max="350"
                :step="1"
                placeholder="请输入立定跳远成绩"
                class="w-full"
              />
            </el-form-item>

            <el-form-item :label="strengthTestLabel" prop="strengthTest">
              <el-input-number
                v-model="scoreForm.strengthTest"
                :min="0"
                :max="100"
                :step="1"
                :placeholder="`请输入${strengthTestLabel}成绩`"
                class="w-full"
              />
            </el-form-item>
          </div>

          <!-- 柔韧性项目 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">柔韧性测试</h3>
            
            <el-form-item label="坐位体前屈 (cm)" prop="sitAndReach">
              <el-input-number
                v-model="scoreForm.sitAndReach"
                :min="-20"
                :max="50"
                :precision="1"
                :step="0.1"
                placeholder="请输入坐位体前屈成绩"
                class="w-full"
              />
            </el-form-item>
          </div>

          <!-- 耐力项目 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">耐力测试</h3>
            
            <el-form-item :label="longRunLabel" prop="longRun">
              <el-time-picker
                v-model="longRunTime"
                format="mm:ss"
                value-format="HH:mm:ss"
                placeholder="请选择长跑成绩"
                @change="handleLongRunChange"
                class="w-full"
              />
              <div class="text-xs text-gray-500 mt-1">
                格式：分:秒，如 3:25 表示3分25秒
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-center gap-4 mt-8 pt-6 border-t">
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            size="large"
            @click="submitScore"
            :loading="submitting"
          >
            保存成绩
          </el-button>
          <el-button
            type="success"
            size="large"
            @click="submitAndNext"
            :loading="submitting"
          >
            保存并录入下一个
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Switch
} from '@element-plus/icons-vue'
import { scoreApi } from '@/api/score'
import { studentApi } from '@/api/student'
import type { Student } from '@/types/api'

const route = useRoute()
const router = useRouter()

// 表单引用
const scoreFormRef = ref()

// 响应式数据
const studentLoading = ref(false)
const submitting = ref(false)
const students = ref<Student[]>([])
const selectedStudent = ref<Student | null>(null)

// 学生筛选
const studentFilters = reactive({
  grade: '',
  className: '',
  keyword: ''
})

// 学生分页
const studentPagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 成绩表单
const scoreForm = reactive({
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  vitalCapacity: undefined as number | undefined,
  run50m: undefined as number | undefined,
  longJump: undefined as number | undefined,
  sitAndReach: undefined as number | undefined,
  longRun: undefined as number | undefined,
  strengthTest: undefined as number | undefined,
  year: new Date().getFullYear()
})

// 长跑时间选择器
const longRunTime = ref<string>('')

// 计算属性
const bmi = computed(() => {
  if (scoreForm.height && scoreForm.weight) {
    const heightM = scoreForm.height / 100
    return scoreForm.weight / (heightM * heightM)
  }
  return null
})

const strengthTestLabel = computed(() => {
  return selectedStudent.value?.gender === 'male' ? '引体向上 (次)' : '仰卧起坐 (次/分钟)'
})

const longRunLabel = computed(() => {
  return selectedStudent.value?.gender === 'male' ? '1000米跑' : '800米跑'
})

// 选项数据
const gradeOptions = ['高一', '高二', '高三']
const classOptions = ref<string[]>([])

// 表单验证规则
const scoreRules = {
  height: [
    { type: 'number', min: 100, max: 250, message: '身高应在100-250cm之间', trigger: 'blur' }
  ],
  weight: [
    { type: 'number', min: 20, max: 200, message: '体重应在20-200kg之间', trigger: 'blur' }
  ],
  vitalCapacity: [
    { type: 'number', min: 1000, max: 8000, message: '肺活量应在1000-8000ml之间', trigger: 'blur' }
  ],
  run50m: [
    { type: 'number', min: 5, max: 15, message: '50米跑成绩应在5-15秒之间', trigger: 'blur' }
  ],
  longJump: [
    { type: 'number', min: 100, max: 350, message: '立定跳远成绩应在100-350cm之间', trigger: 'blur' }
  ],
  sitAndReach: [
    { type: 'number', min: -20, max: 50, message: '坐位体前屈成绩应在-20-50cm之间', trigger: 'blur' }
  ],
  strengthTest: [
    { type: 'number', min: 0, max: 100, message: '力量测试成绩应在0-100之间', trigger: 'blur' }
  ]
}

// 加载学生列表
const loadStudents = async () => {
  try {
    studentLoading.value = true
    const response = await studentApi.getStudents({
      page: studentPagination.page,
      limit: studentPagination.limit,
      ...studentFilters
    })
    students.value = response.data
    studentPagination.total = response.pagination.total
  } catch (error) {
    console.error('加载学生失败:', error)
    generateMockStudents()
  } finally {
    studentLoading.value = false
  }
}

// 生成模拟学生数据
const generateMockStudents = () => {
  const mockStudents: Student[] = []
  for (let i = 1; i <= 30; i++) {
    mockStudents.push({
      id: i,
      name: `学生${i}`,
      gender: i % 2 === 0 ? 'female' : 'male',
      className: `高一${String.fromCharCode(65 + (i % 6))}班`,
      grade: '高一',
      hasData: Math.random() > 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  students.value = mockStudents.slice((studentPagination.page - 1) * studentPagination.limit, studentPagination.page * studentPagination.limit)
  studentPagination.total = mockStudents.length
}

// 搜索学生
const searchStudents = () => {
  studentPagination.page = 1
  loadStudents()
}

// 分页处理
const handleStudentSizeChange = (size: number) => {
  studentPagination.limit = size
  studentPagination.page = 1
  loadStudents()
}

const handleStudentCurrentChange = (page: number) => {
  studentPagination.page = page
  loadStudents()
}

// 选择学生
const selectStudent = async (student: Student) => {
  selectedStudent.value = student
  await loadStudentScore(student.id)
}

// 更换学生
const changeStudent = () => {
  selectedStudent.value = null
  resetForm()
}

// 加载学生成绩
const loadStudentScore = async (studentId: number) => {
  try {
    const detail = await scoreApi.getStudentScore(studentId, scoreForm.year)
    if (detail.currentYear.items.length > 0) {
      // 填充现有成绩
      detail.currentYear.items.forEach(item => {
        switch (item.item) {
          case 'height':
            scoreForm.height = item.rawValue
            break
          case 'weight':
            scoreForm.weight = item.rawValue
            break
          case 'vitalCapacity':
            scoreForm.vitalCapacity = item.rawValue
            break
          case 'run50m':
            scoreForm.run50m = item.rawValue
            break
          case 'longJump':
            scoreForm.longJump = item.rawValue
            break
          case 'sitAndReach':
            scoreForm.sitAndReach = item.rawValue
            break
          case 'longRun':
            scoreForm.longRun = item.rawValue
            // 转换为时间格式
            const minutes = Math.floor(item.rawValue / 60)
            const seconds = Math.floor(item.rawValue % 60)
            longRunTime.value = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            break
          case 'strengthTest':
            scoreForm.strengthTest = item.rawValue
            break
        }
      })
    }
  } catch (error) {
    console.error('加载学生成绩失败:', error)
  }
}

// 处理长跑时间变化
const handleLongRunChange = (value: string) => {
  if (value) {
    const parts = value.split(':')
    const minutes = parseInt(parts[1])
    const seconds = parseInt(parts[2])
    scoreForm.longRun = minutes * 60 + seconds
  } else {
    scoreForm.longRun = undefined
  }
}

// 重置表单
const resetForm = () => {
  Object.keys(scoreForm).forEach(key => {
    if (key !== 'year') {
      ;(scoreForm as any)[key] = undefined
    }
  })
  longRunTime.value = ''
  scoreFormRef.value?.clearValidate()
}

// 提交成绩
const submitScore = async () => {
  if (!selectedStudent.value) {
    ElMessage.error('请先选择学生')
    return
  }

  try {
    await scoreFormRef.value.validate()
    submitting.value = true

    const data = { ...scoreForm }
    delete (data as any).year

    await scoreApi.updateScore(selectedStudent.value.id, data)
    ElMessage.success('成绩保存成功')
    
    // 更新学生hasData状态
    selectedStudent.value.hasData = true
  } catch (error) {
    console.error('保存成绩失败:', error)
    ElMessage.error('保存成绩失败')
  } finally {
    submitting.value = false
  }
}

// 保存并录入下一个
const submitAndNext = async () => {
  await submitScore()
  if (!submitting.value) {
    // 找到下一个学生
    const currentIndex = students.value.findIndex(s => s.id === selectedStudent.value?.id)
    if (currentIndex < students.value.length - 1) {
      selectStudent(students.value[currentIndex + 1])
    } else {
      ElMessage.info('已是最后一个学生')
    }
  }
}

// BMI相关函数
const getBmiClass = (bmi: number) => {
  if (bmi < 18.5) return 'text-blue-600'
  if (bmi < 24) return 'text-green-600'
  if (bmi < 28) return 'text-orange-600'
  return 'text-red-600'
}

const getBmiLabel = (bmi: number) => {
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏胖'
  return '肥胖'
}

// 加载班级选项
const loadClassOptions = () => {
  classOptions.value = [
    '高一A班', '高一B班', '高一C班', '高一D班',
    '高二A班', '高二B班', '高二C班', '高二D班',
    '高三A班', '高三B班', '高三C班', '高三D班'
  ]
}

// 初始化
onMounted(async () => {
  loadClassOptions()
  await loadStudents()
  
  // 如果URL中有studentId参数，直接选择该学生
  const studentId = route.query.studentId
  if (studentId) {
    const student = students.value.find(s => s.id === Number(studentId))
    if (student) {
      selectStudent(student)
    }
  }
})
</script>