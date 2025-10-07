<template>
  <div class="p-6 w-full h-full">
    <!-- 欢迎区域 -->
    <div class="flex justify-between items-center mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}！
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ currentDate }} | {{ userRole }}
        </p>
      </div>
      
      <div class="flex gap-3">
        <el-button type="primary" @click="router.push('/students')">
          <el-icon><User /></el-icon>
          学生管理
        </el-button>
        <el-button type="success" @click="router.push('/scores')">
          <el-icon><DataAnalysis /></el-icon>
          成绩管理
        </el-button>
        <el-button type="info" @click="router.push('/analysis')">
          <el-icon><TrendCharts /></el-icon>
          数据分析
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
        <div class="flex items-center">
          <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
            <el-icon class="text-white text-2xl"><User /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.totalStudents }}</div>
            <div class="text-gray-600 dark:text-gray-400">学生总数</div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
        <div class="flex items-center">
          <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
            <el-icon class="text-white text-2xl"><Check /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.completedTests }}</div>
            <div class="text-gray-600 dark:text-gray-400">已完成体测</div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
        <div class="flex items-center">
          <div class="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center">
            <el-icon class="text-white text-2xl"><Warning /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.pendingTests }}</div>
            <div class="text-gray-600 dark:text-gray-400">待完成体测</div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
        <div class="flex items-center">
          <div class="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center">
            <el-icon class="text-white text-2xl"><DataAnalysis /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.averageScore.toFixed(1) }}</div>
            <div class="text-gray-600 dark:text-gray-400">平均分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <el-card class="shadow-lg">
          <template #header>
            <span class="text-lg font-semibold">成绩趋势</span>
          </template>
          <div class="h-80 flex flex-col items-center justify-center text-gray-400">
            <el-icon class="text-6xl mb-4"><TrendCharts /></el-icon>
            <p>图表组件将在后续实现</p>
          </div>
        </el-card>
      </div>
      
      <div>
        <el-card class="shadow-lg">
          <template #header>
            <span class="text-lg font-semibold">最近活动</span>
          </template>
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id" 
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <el-icon class="text-blue-600 dark:text-blue-400"><component :is="activity.icon" /></el-icon>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-800 dark:text-white">{{ activity.title }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  DataAnalysis, 
  TrendCharts, 
  Check, 
  Warning,
  Upload,
  Edit,
  Setting
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const stats = ref({
  totalStudents: 0,
  completedTests: 0,
  pendingTests: 0,
  averageScore: 0,
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '上传了学生数据',
    time: '2小时前',
    icon: Upload,
  },
  {
    id: 2,
    title: '录入了体测成绩',
    time: '4小时前',
    icon: Edit,
  },
  {
    id: 3,
    title: '更新了评分标准',
    time: '1天前',
    icon: Setting,
  },
])

// 当前日期
const currentDate = computed(() => {
  return formatDate(new Date(), 'YYYY年MM月DD日')
})

// 用户角色
const userRole = computed(() => {
  const role = userStore.userInfo?.role
  switch (role) {
    case 'admin':
      return '系统管理员'
    case 'class':
      return '班主任'
    default:
      return '用户'
  }
})

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    // 这里模拟数据加载
    stats.value = {
      totalStudents: 1250,
      completedTests: 980,
      pendingTests: 270,
      averageScore: 82.5,
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

