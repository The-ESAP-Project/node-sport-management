<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'

const userStore = useUserStore()
const systemStore = useSystemStore()

onMounted(() => {
  // 初始化用户存储
  userStore.initFromStorage()
  
  // 初始化系统主题
  systemStore.initTheme()
})
</script>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* 暗黑模式适配 */
html.dark {
  color-scheme: dark;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
}

::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-fill-color-darker);
}

/* Element Plus 自定义样式 */
.el-menu--collapse .el-menu-item .el-icon,
.el-menu--collapse .el-sub-menu .el-sub-menu__icon-arrow {
  margin: 0;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
