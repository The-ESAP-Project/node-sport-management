<template>
  <template v-if="!route.children || !hasVisibleChildren">
    <!-- 单级菜单 -->
    <el-menu-item :index="route.path">
      <el-icon v-if="route.meta?.icon">
        <component :is="route.meta.icon" />
      </el-icon>
      <template #title>
        <span>{{ route.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>

  <template v-else>
    <!-- 多级菜单 -->
    <el-sub-menu :index="route.path">
      <template #title>
        <el-icon v-if="route.meta?.icon">
          <component :is="route.meta.icon" />
        </el-icon>
        <span>{{ route.meta?.title }}</span>
      </template>
      
      <template v-for="child in visibleChildren" :key="child.path">
        <sidebar-item :route="child" :base-path="resolvePath(child.path)" />
      </template>
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface Props {
  route: RouteRecordNormalized
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
})

const userStore = useUserStore()

// 解析完整路径
const resolvePath = (routePath: string): string => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}

// 获取可见的子路由
const visibleChildren = computed(() => {
  if (!props.route.children) return []
  
  return props.route.children.filter(child => {
    // 过滤隐藏的路由
    if (child.meta?.hidden) return false
    
    // 检查权限
    if (child.meta?.permissions) {
      return userStore.hasAnyPermission(child.meta.permissions as string[])
    }
    
    return true
  })
})

// 是否有可见的子路由
const hasVisibleChildren = computed(() => {
  return visibleChildren.value.length > 0
})
</script>