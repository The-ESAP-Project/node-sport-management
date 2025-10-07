import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'Dashboard' },
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('@/views/students/StudentListView.vue'),
        meta: { 
          title: '学生管理', 
          icon: 'User',
          permissions: ['student:read'] 
        },
      },
      {
        path: 'students/:id',
        name: 'student-detail',
        component: () => import('@/views/students/StudentDetailView.vue'),
        meta: { 
          title: '学生详情',
          hidden: true,
          permissions: ['student:read'] 
        },
      },
      {
        path: 'scores',
        name: 'scores',
        component: () => import('@/views/scores/ScoreListView.vue'),
        meta: { 
          title: '成绩管理', 
          icon: 'DataAnalysis',
          permissions: ['score:read'] 
        },
      },
      {
        path: 'scores/input',
        name: 'score-input',
        component: () => import('@/views/scores/ScoreInputView.vue'),
        meta: { 
          title: '成绩录入',
          hidden: true,
          permissions: ['score:write'] 
        },
      },
      {
        path: 'scores/import',
        name: 'score-import',
        component: () => import('@/views/scores/ScoreImportView.vue'),
        meta: { 
          title: '成绩导入',
          hidden: true,
          permissions: ['score:write'] 
        },
      },
      {
        path: 'analysis',
        name: 'analysis',
        component: () => import('@/views/analysis/AnalysisView.vue'),
        meta: { 
          title: '数据分析', 
          icon: 'TrendCharts',
          permissions: ['analysis:read'] 
        },
      },
      {
        path: 'standards',
        name: 'standards',
        component: () => import('@/views/standards/StandardListView.vue'),
        meta: { 
          title: '评分标准', 
          icon: 'Setting',
          permissions: ['standard:read'] 
        },
      },
      {
        path: 'system',
        name: 'system',
        redirect: '/system/config',
        meta: { 
          title: '系统管理', 
          icon: 'Tools',
          permissions: ['system:read'] 
        },
        children: [
          {
            path: 'config',
            name: 'system-config',
            component: () => import('@/views/system/ConfigView.vue'),
            meta: { 
              title: '系统配置',
              permissions: ['system:write'] 
            },
          },
          {
            path: 'users',
            name: 'system-users',
            component: () => import('@/views/system/UserListView.vue'),
            meta: { 
              title: '用户管理',
              permissions: ['user:read'] 
            },
          },
        ],
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人资料', hidden: true },
      },
    ],
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403View.vue'),
    meta: { title: '访问被拒绝' },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404View.vue'),
    meta: { title: '页面不存在' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
  }
  
  // 如果是登录页面且已登录，重定向到仪表盘
  if (to.name === 'login' && userStore.isLoggedIn) {
    next('/dashboard')
    return
  }
  
  // 检查是否需要认证
  if (to.meta?.requiresAuth !== false) {
    if (!userStore.isLoggedIn) {
      next('/login')
      return
    }
    
    // 检查权限
    if (to.meta?.permissions && Array.isArray(to.meta.permissions)) {
      const hasPermission = userStore.hasAnyPermission(to.meta.permissions as string[])
      if (!hasPermission) {
        next('/403')
        return
      }
    }
  }
  
  next()
})

export default router
