<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>{{ appTitle }}</h1>
        <p>学生体测数据管理与分析平台</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <div class="demo-accounts">
          <h4>演示账号</h4>
          <div class="demo-account-list">
            <el-tag
              v-for="account in demoAccounts"
              :key="account.username"
              class="demo-account"
              @click="fillDemoAccount(account)"
            >
              {{ account.label }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import type { LoginForm } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

// 应用标题
const appTitle = import.meta.env.VITE_APP_TITLE || '学生体测管理系统'

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 登录表单
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
})

// 表单验证规则
const loginRules: FormRules<LoginForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 演示账号
const demoAccounts = [
  { username: 'admin', password: 'admin123', label: '管理员' },
  { username: 'teacher1', password: 'teacher123', label: '班主任' },
]

// 填充演示账号
const fillDemoAccount = (account: { username: string; password: string }) => {
  loginForm.username = account.username
  loginForm.password = account.password
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    const response = await authApi.login(loginForm)
    
    // 保存token和用户信息
    userStore.setToken(response.token)
    userStore.setUserInfo(response.user)
    
    ElMessage.success('登录成功')
    
    // 跳转到仪表盘
    router.push('/dashboard')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.demo-accounts h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.demo-account-list {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.demo-account {
  cursor: pointer;
  transition: all 0.3s;
}

.demo-account:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

/* 暗黑模式适配 */
.dark .login-box {
  background: rgba(31, 41, 55, 0.95);
  color: #f9fafb;
}

.dark .login-header h1 {
  color: #f9fafb;
}

.dark .login-header p {
  color: #d1d5db;
}

.dark .demo-accounts h4 {
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-box {
    width: 90%;
    margin: 0 20px;
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>