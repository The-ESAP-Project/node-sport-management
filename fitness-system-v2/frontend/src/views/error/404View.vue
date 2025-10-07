<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon><QuestionFilled /></el-icon>
      </div>
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除。</p>
      <div class="error-actions">
        <el-button @click="$router.go(-1)">返回上页</el-button>
        <el-button type="primary" @click="$router.push('/dashboard')">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  margin-bottom: 24px;
}

.error-icon .el-icon {
  font-size: 120px;
  color: var(--el-color-warning);
}

h1 {
  font-size: 72px;
  margin: 0 0 16px 0;
  color: var(--el-color-warning);
  font-weight: 700;
}

h2 {
  font-size: 24px;
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

p {
  margin: 0 0 32px 0;
  color: var(--el-text-color-regular);
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>