<template>
  <div class="placeholder-view">
    <el-card>
      <template #header>
        <span>学生详情</span>
      </template>
      <div class="placeholder-content">
        <el-icon><User /></el-icon>
        <h3>学生详情功能</h3>
        <p>此功能正在开发中，敬请期待</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
</script>

<style scoped>
.placeholder-view {
  padding: 24px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--el-text-color-placeholder);
}

.placeholder-content .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder-content h3 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
}

.placeholder-content p {
  margin: 0;
}
</style>