<template>
  <div class="profile-view">
    <el-card>
      <template #header>
        <span>个人资料</span>
      </template>
      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userStore.userInfo?.avatar">
            {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
          </el-avatar>
          <el-button type="primary" style="margin-top: 16px;">上传头像</el-button>
        </div>
        
        <div class="info-section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">
              {{ userStore.userInfo?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userStore.userInfo?.nickname || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              {{ userRole }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(userStore.userInfo?.createdAt || '') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils'

const userStore = useUserStore()

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
</script>

<style scoped>
.profile-view {
  padding: 24px;
}

.profile-content {
  display: flex;
  gap: 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-section {
  flex: 1;
}
</style>