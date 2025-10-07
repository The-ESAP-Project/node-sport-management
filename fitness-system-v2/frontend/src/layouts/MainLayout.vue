<template>
  <div class="h-screen w-full flex">
    <!-- 侧边栏 -->
    <el-aside 
      :width="sidebarWidth" 
      class="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300"
      :class="{ 'w-16': systemStore.sidebarCollapsed }"
    >
      <div class="h-15 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
        <div v-if="!systemStore.sidebarCollapsed" class="text-lg font-semibold text-blue-600">
          {{ appTitle }}
        </div>
        <div v-else class="text-base font-semibold text-blue-600">
          体测
        </div>
      </div>
      
      <el-scrollbar class="h-[calc(100vh-60px)]">
        <el-menu
          :default-active="activeMenu"
          :collapse="systemStore.sidebarCollapsed"
          :unique-opened="true"
          router
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <sidebar-item :route="route" />
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <!-- 主体内容 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航 -->
      <el-header class="flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <el-button
            :icon="systemStore.sidebarCollapsed ? Expand : Fold"
            @click="systemStore.toggleSidebar()"
            text
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="flex items-center gap-4">
          <el-button
            :icon="systemStore.theme === 'dark' ? Sunny : Moon"
            @click="systemStore.toggleTheme()"
            text
          />
          
          <el-dropdown @command="handleUserCommand">
            <div class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <el-avatar :size="32">
                {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
              </el-avatar>
              <span class="text-sm">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto p-0">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  Moon,
  Sunny,
  CaretBottom,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import SidebarItem from '@/components/Sidebar/SidebarItem.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const systemStore = useSystemStore()

// 应用标题
const appTitle = import.meta.env.VITE_APP_TITLE || '学生体测管理系统'

// 侧边栏宽度
const sidebarWidth = computed(() => 
  systemStore.sidebarCollapsed ? '64px' : '240px'
)

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  return meta?.activeMenu || path
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta?.title as string,
  }))
})

// 过滤菜单路由
const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  const mainRoute = routes.find(route => route.path === '/')
  
  if (!mainRoute?.children) return []
  
  return mainRoute.children.filter(route => {
    // 过滤隐藏的路由
    if (route.meta?.hidden) return false
    
    // 检查权限
    if (route.meta?.permissions) {
      return userStore.hasAnyPermission(route.meta.permissions as string[])
    }
    
    return true
  }) as any[]
})

// 用户操作处理
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        userStore.logout()
        ElMessage.success('退出登录成功')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}

// 监听路由变化，自动收起移动端侧边栏
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 768 && !systemStore.sidebarCollapsed) {
      systemStore.setSidebarCollapsed(true)
    }
  }
)
</script>

<style>
/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    height: 100vh;
  }
  
  .main-container {
    margin-left: 0 !important;
  }
  
  .sidebar-collapsed + .main-container {
    margin-left: 0;
  }
}
</style>