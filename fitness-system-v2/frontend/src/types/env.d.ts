// 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_SIZE_LIMIT: string
  readonly VITE_TOKEN_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}