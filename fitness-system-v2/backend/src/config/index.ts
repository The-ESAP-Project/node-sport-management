import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

export const config = {
  // 服务配置
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'fitness_system',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: process.env.DB_DIALECT as 'postgres' || 'postgres',
    logging: process.env.NODE_ENV === 'development'
  },
  
  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400'), // 24小时（秒）
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800'), // 7天（秒）
    audience: process.env.JWT_AUDIENCE || 'fitness-system',
    issuer: process.env.JWT_ISSUER || 'fitness-system-api'
  },
  
  // 默认管理员配置
  defaultAdmin: {
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456'
  },
  
  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel')
      .split(','),
    tempDir: path.join(__dirname, '../../temp'),
    exportsDir: path.join(__dirname, '../../exports')
  },
  
  // 系统配置
  system: {
    uploadDeadline: new Date(process.env.UPLOAD_DEADLINE || '2024-12-31T23:59:59Z'),
    currentYear: parseInt(process.env.CURRENT_YEAR || '2024')
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // CORS配置
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
      .split(','),
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173']
  },

  // 限流配置
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000') // 每15分钟最大请求数
  }
};

export default config;