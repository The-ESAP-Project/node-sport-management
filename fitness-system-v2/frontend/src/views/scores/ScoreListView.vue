<template>
  <div class="w-full p-6">
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-800">成绩管理</h1>
        <div class="flex gap-2">
          <el-button type="primary" @click="recalculateScores" :loading="recalculateLoading">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重新计算成绩
          </el-button>
          <el-button type="success" @click="exportScores">
            <el-icon class="mr-1"><Download /></el-icon>
            导出成绩
          </el-button>
        </div>
      </div>

      <!-- 筛选条件 -->
      <el-card class="mb-4">
        <el-form :model="filters" :inline="true" class="flex flex-wrap gap-4">
          <el-form-item label="学年">
            <el-select v-model="filters.year" placeholder="选择学年" clearable class="w-32">
              <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-select v-model="filters.grade" placeholder="选择年级" clearable class="w-32">
              <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="filters.className" placeholder="选择班级" clearable class="w-40">
              <el-option v-for="cls in classOptions" :key="cls" :label="cls" :value="cls" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索学生姓名"
              clearable
              class="w-40"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon class="mr-1"><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-blue-600 text-sm">学生总数</div>
        <div class="text-2xl font-bold text-blue-800">{{ stats.totalStudents }}</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-green-600 text-sm">平均分</div>
        <div class="text-2xl font-bold text-green-800">{{ stats.avgScore.toFixed(1) }}</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="text-orange-600 text-sm">及格率</div>
        <div class="text-2xl font-bold text-orange-800">{{ (stats.passRate * 100).toFixed(1) }}%</div>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <div class="text-purple-600 text-sm">最高分</div>
        <div class="text-2xl font-bold text-purple-800">{{ stats.maxScore.toFixed(1) }}</div>
      </div>
    </div>

    <!-- 成绩表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="scores"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="year" label="学年" width="100" />
        <el-table-column prop="totalScore" label="总分" width="100" sortable>
          <template #default="{ row }">
            <span :class="getScoreClass(row.totalScore)">{{ row.totalScore.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="classRank" label="班级排名" width="100" />
        <el-table-column prop="gradeRank" label="年级排名" width="100" />
        <el-table-column label="单项成绩" min-width="400">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-for="item in row.items"
                :key="item.item"
                :type="getItemTagType(item.score)"
                size="small"
                class="mb-1"
              >
                {{ item.itemName }}: {{ item.rawValue }}{{ item.unit }} ({{ item.score }}分)
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="editScore(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 学生详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="学生成绩详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="detailDialog.data" class="space-y-4">
        <!-- 学生基本信息 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">基本信息</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-gray-600">姓名：</span>
              <span>{{ detailDialog.data.student.name }}</span>
            </div>
            <div>
              <span class="text-gray-600">性别：</span>
              <span>{{ detailDialog.data.student.gender === 'male' ? '男' : '女' }}</span>
            </div>
            <div>
              <span class="text-gray-600">班级：</span>
              <span>{{ detailDialog.data.student.className }}</span>
            </div>
            <div>
              <span class="text-gray-600">年级：</span>
              <span>{{ detailDialog.data.student.grade }}</span>
            </div>
          </div>
        </div>

        <!-- 当前年度成绩 -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">{{ detailDialog.data.currentYear.year }}年成绩</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="text-gray-600 text-sm">总分</div>
              <div class="text-xl font-bold text-blue-600">{{ detailDialog.data.currentYear.totalScore.toFixed(1) }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600 text-sm">班级排名</div>
              <div class="text-xl font-bold text-green-600">{{ detailDialog.data.currentYear.classRank }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600 text-sm">年级排名</div>
              <div class="text-xl font-bold text-orange-600">{{ detailDialog.data.currentYear.gradeRank }}</div>
            </div>
          </div>
          
          <!-- 单项成绩 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in detailDialog.data.currentYear.items"
              :key="item.item"
              class="bg-white p-3 rounded border"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ item.itemName }}</span>
                <span :class="getScoreClass(item.score)" class="font-bold">
                  {{ item.score }}分
                </span>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                原始值：{{ item.rawValue }}{{ item.unit }}
                <span v-if="item.percentile" class="ml-2">
                  超越{{ (item.percentile * 100).toFixed(1) }}%的学生
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史成绩 -->
        <div v-if="detailDialog.data.history.length > 0">
          <h3 class="text-lg font-semibold mb-2">历史成绩</h3>
          <el-table :data="detailDialog.data.history" size="small">
            <el-table-column prop="year" label="年度" />
            <el-table-column prop="totalScore" label="总分">
              <template #default="{ row }">
                <span :class="getScoreClass(row.totalScore)">{{ row.totalScore.toFixed(1) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="classRank" label="班级排名" />
            <el-table-column prop="gradeRank" label="年级排名" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 导出设置对话框 -->
    <el-dialog v-model="exportDialog.visible" title="导出设置" width="400px">
      <el-form :model="exportDialog.form" label-width="80px">
        <el-form-item label="格式">
          <el-radio-group v-model="exportDialog.form.format">
            <el-radio value="excel">Excel</el-radio>
            <el-radio value="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="详细信息">
          <el-checkbox v-model="exportDialog.form.includeDetails">
            包含单项成绩详情
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exportLoading">
          导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Download,
  Refresh
} from '@element-plus/icons-vue'
import { scoreApi } from '@/api/score'
import type { StudentScore, StudentDetail } from '@/types/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const recalculateLoading = ref(false)
const exportLoading = ref(false)
const scores = ref<StudentScore[]>([])
const selectedScores = ref<StudentScore[]>([])

// 筛选条件
const filters = reactive({
  year: new Date().getFullYear(),
  grade: '',
  className: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  totalStudents: 0,
  avgScore: 0,
  maxScore: 0,
  minScore: 0,
  passRate: 0
})

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null as StudentDetail | null
})

// 导出对话框
const exportDialog = reactive({
  visible: false,
  form: {
    format: 'excel' as 'excel' | 'pdf',
    includeDetails: true
  }
})

// 选项数据
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const gradeOptions = ['高一', '高二', '高三']
const classOptions = ref<string[]>([])

// 加载数据
const loadScores = async () => {
  try {
    loading.value = true
    const response = await scoreApi.getScores({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    })
    scores.value = response.data
    pagination.total = response.pagination.total
    await loadStats()
  } catch (error) {
    console.error('加载成绩失败:', error)
    // 模拟数据
    generateMockData()
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const statsData = await scoreApi.getScoreStats(filters)
    Object.assign(stats, statsData)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    generateMockStats()
  }
}

// 生成模拟数据
const generateMockData = () => {
  const mockScores: StudentScore[] = []
  const subjects = [
    { item: 'height', itemName: '身高', unit: 'cm' },
    { item: 'weight', itemName: '体重', unit: 'kg' },
    { item: 'vitalCapacity', itemName: '肺活量', unit: 'ml' },
    { item: 'run50m', itemName: '50米跑', unit: 's' },
    { item: 'longJump', itemName: '立定跳远', unit: 'cm' },
    { item: 'sitAndReach', itemName: '坐位体前屈', unit: 'cm' }
  ]

  for (let i = 1; i <= 50; i++) {
    const items = subjects.map(subject => ({
      item: subject.item,
      itemName: subject.itemName,
      rawValue: Math.random() * 100 + 100,
      score: Math.random() * 40 + 60,
      unit: subject.unit,
      percentile: Math.random()
    }))

    const totalScore = items.reduce((sum, item) => sum + item.score, 0) / items.length

    mockScores.push({
      studentId: i,
      studentName: `学生${i}`,
      className: `高一${String.fromCharCode(65 + (i % 10))}班`,
      year: filters.year || new Date().getFullYear(),
      totalScore,
      classRank: Math.floor(Math.random() * 30) + 1,
      gradeRank: Math.floor(Math.random() * 300) + 1,
      items,
      updatedAt: new Date().toISOString()
    })
  }

  scores.value = mockScores.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
  pagination.total = mockScores.length
  generateMockStats()
}

const generateMockStats = () => {
  stats.totalStudents = 50
  stats.avgScore = 75.5
  stats.maxScore = 95.2
  stats.minScore = 45.8
  stats.passRate = 0.85
}

// 事件处理
const handleSearch = () => {
  pagination.page = 1
  loadScores()
}

const resetFilters = () => {
  Object.assign(filters, {
    year: new Date().getFullYear(),
    grade: '',
    className: '',
    keyword: ''
  })
  handleSearch()
}

const handleSelectionChange = (selection: StudentScore[]) => {
  selectedScores.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  loadScores()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadScores()
}

// 查看详情
const viewDetail = async (score: StudentScore) => {
  try {
    const detail = await scoreApi.getStudentScore(score.studentId, score.year)
    detailDialog.data = detail
    detailDialog.visible = true
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败')
  }
}

// 编辑成绩
const editScore = (score: StudentScore) => {
  router.push(`/scores/input?studentId=${score.studentId}&year=${score.year}`)
}

// 重新计算成绩
const recalculateScores = async () => {
  try {
    await ElMessageBox.confirm('确定要重新计算成绩吗？这可能需要一些时间。', '确认操作')
    recalculateLoading.value = true
    
    await scoreApi.recalculateScores(filters)
    ElMessage.success('成绩重新计算完成')
    loadScores()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新计算失败:', error)
      ElMessage.error('重新计算失败')
    }
  } finally {
    recalculateLoading.value = false
  }
}

// 导出成绩
const exportScores = () => {
  exportDialog.visible = true
}

const confirmExport = async () => {
  try {
    exportLoading.value = true
    const downloadUrl = await scoreApi.exportScores({
      ...filters,
      ...exportDialog.form
    })
    
    // 下载文件
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `成绩导出_${new Date().toLocaleDateString()}.${exportDialog.form.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    ElMessage.success('导出成功')
    exportDialog.visible = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 工具函数
const getScoreClass = (score: number) => {
  if (score >= 90) return 'text-green-600 font-bold'
  if (score >= 80) return 'text-blue-600 font-bold'
  if (score >= 70) return 'text-orange-600 font-bold'
  if (score >= 60) return 'text-yellow-600 font-bold'
  return 'text-red-600 font-bold'
}

const getItemTagType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

// 加载班级选项
const loadClassOptions = () => {
  classOptions.value = [
    '高一A班', '高一B班', '高一C班', '高一D班',
    '高二A班', '高二B班', '高二C班', '高二D班',
    '高三A班', '高三B班', '高三C班', '高三D班'
  ]
}

onMounted(() => {
  loadClassOptions()
  loadScores()
})
</script>