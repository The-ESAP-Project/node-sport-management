<template>
  <div class="w-full p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">数据分析</h1>
      <p class="text-gray-600 mt-1">多维度体测数据分析与统计</p>
    </div>

    <!-- 分析维度选择 -->
    <el-card class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <span>分析维度</span>
          <el-button type="primary" @click="exportReport" :loading="exporting">
            <el-icon class="mr-1"><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </template>

      <el-form :model="analysisForm" :inline="true" class="mb-4">
        <el-form-item label="分析维度">
          <el-radio-group v-model="analysisForm.scope" @change="handleScopeChange">
            <el-radio-button value="personal">个人分析</el-radio-button>
            <el-radio-button value="class">班级分析</el-radio-button>
            <el-radio-button value="grade">年级分析</el-radio-button>
            <el-radio-button value="school">全校分析</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="学年" v-if="analysisForm.scope !== 'personal'">
          <el-select v-model="analysisForm.year" placeholder="选择学年" class="w-32">
            <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
          </el-select>
        </el-form-item>

        <el-form-item label="年级" v-if="analysisForm.scope === 'class'">
          <el-select v-model="analysisForm.grade" placeholder="选择年级" class="w-32">
            <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级" v-if="analysisForm.scope === 'class'">
          <el-select v-model="analysisForm.className" placeholder="选择班级" class="w-40">
            <el-option v-for="cls in classOptions" :key="cls" :label="cls" :value="cls" />
          </el-select>
        </el-form-item>

        <el-form-item label="年级" v-if="analysisForm.scope === 'grade'">
          <el-select v-model="analysisForm.grade" placeholder="选择年级" class="w-32">
            <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade" />
          </el-select>
        </el-form-item>

        <el-form-item label="学生" v-if="analysisForm.scope === 'personal'">
          <el-select
            v-model="analysisForm.studentId"
            placeholder="搜索学生"
            filterable
            remote
            :remote-method="searchStudents"
            :loading="studentSearchLoading"
            class="w-60"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="`${student.name} (${student.className})`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadAnalysisData" :loading="loading">
            <el-icon class="mr-1"><Search /></el-icon>
            分析
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 个人分析 -->
    <div v-if="analysisForm.scope === 'personal' && analysisData" class="space-y-6">
      <!-- 个人基本信息 -->
      <el-card>
        <template #header>
          <span>学生基本信息</span>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-gray-600">姓名：</span>
            <span class="font-medium">{{ studentDetail?.name }}</span>
          </div>
          <div>
            <span class="text-gray-600">性别：</span>
            <span class="font-medium">{{ studentDetail?.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div>
            <span class="text-gray-600">班级：</span>
            <span class="font-medium">{{ studentDetail?.className }}</span>
          </div>
          <div>
            <span class="text-gray-600">年级：</span>
            <span class="font-medium">{{ studentDetail?.grade }}</span>
          </div>
        </div>
      </el-card>

      <!-- 个人能力雷达图 -->
      <el-card>
        <template #header>
          <span>个人能力分析</span>
        </template>
        <div ref="personalRadarRef" class="w-full h-96"></div>
      </el-card>

      <!-- 个人历史趋势 -->
      <el-card>
        <template #header>
          <span>历史成绩趋势</span>
        </template>
        <div ref="personalTrendRef" class="w-full h-96"></div>
      </el-card>
    </div>

    <!-- 班级/年级/全校分析 -->
    <div v-if="analysisForm.scope !== 'personal' && analysisData" class="space-y-6">
      <!-- 统计概览 -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-blue-600 text-sm">学生总数</div>
          <div class="text-2xl font-bold text-blue-800">{{ analysisData.summary.totalStudents }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-green-600 text-sm">平均分</div>
          <div class="text-2xl font-bold text-green-800">{{ analysisData.summary.avgScore.toFixed(1) }}</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg text-center">
          <div class="text-orange-600 text-sm">最高分</div>
          <div class="text-2xl font-bold text-orange-800">{{ analysisData.summary.maxScore.toFixed(1) }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg text-center">
          <div class="text-red-600 text-sm">最低分</div>
          <div class="text-2xl font-bold text-red-800">{{ analysisData.summary.minScore.toFixed(1) }}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-purple-600 text-sm">及格率</div>
          <div class="text-2xl font-bold text-purple-800">{{ (analysisData.summary.passRate * 100).toFixed(1) }}%</div>
        </div>
      </div>

      <!-- 成绩分布图 -->
      <el-card>
        <template #header>
          <span>成绩分布分析</span>
        </template>
        <div ref="distributionRef" class="w-full h-96"></div>
      </el-card>

      <!-- 历年趋势对比 -->
      <el-card v-if="trendData">
        <template #header>
          <span>历年趋势对比</span>
        </template>
        <div ref="trendRef" class="w-full h-96"></div>
      </el-card>

      <!-- 排名列表 -->
      <el-card v-if="rankingData">
        <template #header>
          <div class="flex justify-between items-center">
            <span>排名列表</span>
            <el-radio-group v-model="rankingType" size="small">
              <el-radio-button value="student">学生排名</el-radio-button>
              <el-radio-button value="class" v-if="analysisForm.scope !== 'class'">班级排名</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <!-- 学生排名 -->
        <el-table v-if="rankingType === 'student'" :data="rankingData.rankings.slice(0, 20)" stripe>
          <el-table-column prop="rank" label="排名" width="80">
            <template #default="{ row }">
              <el-tag 
                :type="row.rank <= 3 ? 'danger' : (row.rank <= 10 ? 'warning' : 'info')"
                class="font-bold"
              >
                {{ row.rank }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column prop="className" label="班级" width="150" />
          <el-table-column prop="totalScore" label="总分" width="100">
            <template #default="{ row }">
              <span class="font-bold text-blue-600">{{ row.totalScore.toFixed(1) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getScoreLevel(row.totalScore).type">
                {{ getScoreLevel(row.totalScore).label }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 班级排名 -->
        <el-table v-if="rankingType === 'class' && rankingData.classRankings" :data="rankingData.classRankings" stripe>
          <el-table-column prop="rank" label="排名" width="80">
            <template #default="{ row }">
              <el-tag 
                :type="row.rank <= 3 ? 'danger' : (row.rank <= 5 ? 'warning' : 'info')"
                class="font-bold"
              >
                {{ row.rank }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="className" label="班级" width="150" />
          <el-table-column prop="avgScore" label="平均分" width="100">
            <template #default="{ row }">
              <span class="font-bold text-green-600">{{ row.avgScore.toFixed(1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="studentCount" label="学生人数" width="100" />
          <el-table-column label="表现" width="100">
            <template #default="{ row }">
              <el-tag :type="getClassPerformance(row.avgScore).type">
                {{ getClassPerformance(row.avgScore).label }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <el-card v-if="!analysisData && !loading" class="text-center py-12">
      <el-icon class="text-6xl text-gray-400 mb-4"><DataAnalysis /></el-icon>
      <div class="text-lg text-gray-600 mb-2">请选择分析条件开始数据分析</div>
      <div class="text-sm text-gray-400">选择分析维度和相关参数，点击分析按钮查看数据</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Download,
  DataAnalysis
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { AnalysisOverview, TrendData, RankingData } from '@/types/api'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const studentSearchLoading = ref(false)
const analysisData = ref<AnalysisOverview | null>(null)
const trendData = ref<TrendData | null>(null)
const rankingData = ref<RankingData | null>(null)
const studentDetail = ref<any>(null)
const rankingType = ref<'student' | 'class'>('student')

// 图表引用
const personalRadarRef = ref<HTMLElement>()
const personalTrendRef = ref<HTMLElement>()
const distributionRef = ref<HTMLElement>()
const trendRef = ref<HTMLElement>()

// 表单数据
const analysisForm = reactive({
  scope: 'class' as 'personal' | 'class' | 'grade' | 'school',
  year: new Date().getFullYear(),
  grade: '',
  className: '',
  studentId: null as number | null
})

// 选项数据
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const gradeOptions = ['高一', '高二', '高三']
const classOptions = ref<string[]>([])
const studentOptions = ref<Array<{ id: number; name: string; className: string }>>([])

// 维度变化处理
const handleScopeChange = () => {
  // 清空之前的数据
  analysisData.value = null
  trendData.value = null
  rankingData.value = null
  studentDetail.value = null
  
  // 重置表单字段
  if (analysisForm.scope !== 'personal') {
    analysisForm.studentId = null
  }
  if (analysisForm.scope === 'school') {
    analysisForm.grade = ''
    analysisForm.className = ''
  }
}

// 学生搜索
const searchStudents = async (query: string) => {
  if (query.length < 2) return
  
  studentSearchLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 生成模拟学生数据
    const mockStudents = []
    for (let i = 1; i <= 10; i++) {
      if (`学生${i}`.includes(query)) {
        mockStudents.push({
          id: i,
          name: `学生${i}`,
          className: `高一${String.fromCharCode(65 + (i % 6))}班`
        })
      }
    }
    studentOptions.value = mockStudents
  } finally {
    studentSearchLoading.value = false
  }
}

// 加载分析数据
const loadAnalysisData = async () => {
  // 验证必填字段
  if (analysisForm.scope === 'personal' && !analysisForm.studentId) {
    ElMessage.error('请选择要分析的学生')
    return
  }
  if (analysisForm.scope === 'class' && (!analysisForm.grade || !analysisForm.className)) {
    ElMessage.error('请选择年级和班级')
    return
  }
  if (analysisForm.scope === 'grade' && !analysisForm.grade) {
    ElMessage.error('请选择年级')
    return
  }

  loading.value = true
  try {
    if (analysisForm.scope === 'personal') {
      await loadPersonalAnalysis()
    } else {
      await loadGroupAnalysis()
    }
  } finally {
    loading.value = false
  }
}

// 加载个人分析数据
const loadPersonalAnalysis = async () => {
  // 模拟个人分析数据
  studentDetail.value = {
    name: '张三',
    gender: 'male',
    className: '高一A班',
    grade: '高一'
  }

  // 等待下一个tick后初始化图表
  await nextTick()
  initPersonalRadarChart()
  initPersonalTrendChart()
}

// 加载群体分析数据
const loadGroupAnalysis = async () => {
  // 生成模拟分析数据
  analysisData.value = {
    scope: analysisForm.scope,
    target: analysisForm.scope === 'class' ? analysisForm.className! : 
            analysisForm.scope === 'grade' ? analysisForm.grade! : '全校',
    year: analysisForm.year,
    summary: {
      totalStudents: Math.floor(Math.random() * 200) + 100,
      avgScore: Math.random() * 20 + 70,
      maxScore: Math.random() * 10 + 90,
      minScore: Math.random() * 20 + 40,
      passRate: Math.random() * 0.3 + 0.7
    },
    distribution: [
      { range: '90-100', count: Math.floor(Math.random() * 20) + 5 },
      { range: '80-89', count: Math.floor(Math.random() * 30) + 15 },
      { range: '70-79', count: Math.floor(Math.random() * 40) + 20 },
      { range: '60-69', count: Math.floor(Math.random() * 25) + 10 },
      { range: '0-59', count: Math.floor(Math.random() * 15) + 5 }
    ]
  }

  // 生成趋势数据
  trendData.value = {
    trends: {
      years: [2022, 2023, 2024],
      avgScores: [75.2, 77.8, 78.5],
      passRates: [0.82, 0.85, 0.87]
    },
    itemTrends: [
      { item: 'height', itemName: '身高', data: [85, 86, 87] },
      { item: 'weight', itemName: '体重', data: [78, 80, 82] },
      { item: 'vitalCapacity', itemName: '肺活量', data: [76, 78, 79] }
    ]
  }

  // 生成排名数据
  rankingData.value = {
    rankings: Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      studentName: `学生${i + 1}`,
      className: `高一${String.fromCharCode(65 + (i % 6))}班`,
      totalScore: 95 - i * 0.5 + Math.random() * 2
    })),
    classRankings: Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      className: `高一${String.fromCharCode(65 + i)}班`,
      avgScore: 85 - i * 1.5 + Math.random() * 3,
      studentCount: Math.floor(Math.random() * 10) + 40
    }))
  }

  // 等待下一个tick后初始化图表
  await nextTick()
  initDistributionChart()
  initTrendChart()
}

// 初始化个人雷达图
const initPersonalRadarChart = () => {
  if (!personalRadarRef.value) return

  const chart = echarts.init(personalRadarRef.value)
  const option = {
    title: {
      text: '个人各项能力评分'
    },
    radar: {
      indicator: [
        { name: '身高', max: 100 },
        { name: '体重', max: 100 },
        { name: '肺活量', max: 100 },
        { name: '50米跑', max: 100 },
        { name: '立定跳远', max: 100 },
        { name: '坐位体前屈', max: 100 },
        { name: '长跑', max: 100 },
        { name: '力量测试', max: 100 }
      ]
    },
    series: [{
      name: '个人能力',
      type: 'radar',
      data: [{
        value: [85, 78, 92, 88, 75, 82, 90, 87],
        name: '当前成绩'
      }],
      areaStyle: {
        opacity: 0.3
      }
    }]
  }
  chart.setOption(option)
}

// 初始化个人趋势图
const initPersonalTrendChart = () => {
  if (!personalTrendRef.value) return

  const chart = echarts.init(personalTrendRef.value)
  const option = {
    title: {
      text: '历年成绩趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总分', '班级排名', '年级排名']
    },
    xAxis: {
      type: 'category',
      data: ['高一', '高二', '高三']
    },
    yAxis: [
      {
        type: 'value',
        name: '分数',
        position: 'left'
      },
      {
        type: 'value',
        name: '排名',
        position: 'right',
        inverse: true
      }
    ],
    series: [
      {
        name: '总分',
        type: 'line',
        data: [75, 78, 82],
        smooth: true
      },
      {
        name: '班级排名',
        type: 'line',
        yAxisIndex: 1,
        data: [8, 6, 4],
        smooth: true
      },
      {
        name: '年级排名',
        type: 'line',
        yAxisIndex: 1,
        data: [45, 38, 28],
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}

// 初始化分布图
const initDistributionChart = () => {
  if (!distributionRef.value || !analysisData.value) return

  const chart = echarts.init(distributionRef.value)
  const option = {
    title: {
      text: '成绩分布统计'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: analysisData.value.distribution.map(d => d.range)
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [{
      name: '学生人数',
      type: 'bar',
      data: analysisData.value.distribution.map(d => d.count),
      itemStyle: {
        color: function(params: any) {
          const colors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#909399']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  }
  chart.setOption(option)
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendRef.value || !trendData.value) return

  const chart = echarts.init(trendRef.value)
  const option = {
    title: {
      text: '历年成绩趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均分', '及格率']
    },
    xAxis: {
      type: 'category',
      data: trendData.value.trends.years
    },
    yAxis: [
      {
        type: 'value',
        name: '平均分',
        position: 'left'
      },
      {
        type: 'value',
        name: '及格率',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '平均分',
        type: 'line',
        data: trendData.value.trends.avgScores,
        smooth: true
      },
      {
        name: '及格率',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.value.trends.passRates.map(r => (r * 100).toFixed(1)),
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}

// 导出报告
const exportReport = async () => {
  if (!analysisData.value) {
    ElMessage.error('请先进行数据分析')
    return
  }

  exporting.value = true
  try {
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('报告导出成功')
  } finally {
    exporting.value = false
  }
}

// 工具函数
const getScoreLevel = (score: number) => {
  if (score >= 90) return { type: 'danger', label: '优秀' }
  if (score >= 80) return { type: 'warning', label: '良好' }
  if (score >= 70) return { type: 'primary', label: '中等' }
  if (score >= 60) return { type: 'info', label: '及格' }
  return { type: 'danger', label: '不及格' }
}

const getClassPerformance = (avgScore: number) => {
  if (avgScore >= 85) return { type: 'danger', label: '优秀' }
  if (avgScore >= 80) return { type: 'warning', label: '良好' }
  if (avgScore >= 75) return { type: 'primary', label: '中等' }
  return { type: 'info', label: '一般' }
}

// 初始化
onMounted(() => {
  // 加载班级选项
  classOptions.value = [
    '高一A班', '高一B班', '高一C班', '高一D班',
    '高二A班', '高二B班', '高二C班', '高二D班',
    '高三A班', '高三B班', '高三C班', '高三D班'
  ]
})
</script>