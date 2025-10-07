# 学生体测管理系统后端

基于 TypeScript + Express + PostgreSQL + Redis 构建的学生体测数据管理系统后端服务。

## 功能特性

- 🔐 **用户认证**: JWT令牌认证，支持管理员和班级账号
- 👥 **用户管理**: 用户CRUD、权限控制、批量创建班级账号
- 🏫 **班级管理**: 班级信息管理、统计功能
- 👨‍🎓 **学生管理**: 学生信息管理、批量导入
- 📊 **体测数据**: 9项体测数据管理、统计分析、排名计算
- 📋 **Excel处理**: Excel导入导出、数据预览、模板下载
- 🔍 **数据验证**: 完整的数据验证和错误处理
- 📈 **统计分析**: 班级统计、年级趋势分析
- ⚡ **缓存机制**: Redis缓存优化性能

## 技术栈

- **后端框架**: Express.js + TypeScript
- **数据库**: PostgreSQL (Sequelize ORM)
- **缓存**: Redis
- **认证**: JWT
- **文件处理**: ExcelJS + Multer
- **日志**: Winston
- **验证**: Express Validator
- **安全**: Helmet + CORS + Rate Limiting

## 快速开始

### 1. 环境要求

- Node.js >= 16.x
- PostgreSQL >= 12.x
- Redis >= 6.x

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库和Redis连接信息。

### 4. 数据库初始化

确保PostgreSQL服务已启动，创建数据库：
```sql
CREATE DATABASE fitness_system;
```

### 5. 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm run build
npm start
```

## API文档

服务启动后访问：`http://localhost:3001/api/v1/docs`

### 主要API端点

#### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息
- `POST /api/v1/auth/change-password` - 修改密码

#### 用户管理
- `POST /api/v1/users` - 创建用户（管理员）
- `GET /api/v1/users` - 获取用户列表（管理员）
- `POST /api/v1/users/batch/class` - 批量创建班级账号（管理员）

#### 班级管理
- `POST /api/v1/classes` - 创建班级（管理员）
- `GET /api/v1/classes` - 获取班级列表
- `GET /api/v1/classes/:id/stats` - 获取班级统计信息

#### 学生管理
- `POST /api/v1/students` - 创建学生
- `GET /api/v1/students/class/:classID` - 根据班级获取学生列表
- `POST /api/v1/students/batch/import` - 批量导入学生

#### 体测数据
- `PUT /api/v1/sport-data/student/:studentID/year/:year` - 创建或更新体测数据
- `GET /api/v1/sport-data/class/:classID/year/:year/stats` - 获取班级体测统计
- `POST /api/v1/sport-data/rankings/year/:year` - 计算排名（管理员）

#### Excel处理
- `POST /api/v1/excel/upload/preview` - 上传并预览Excel
- `POST /api/v1/excel/import/confirm` - 确认导入Excel数据
- `GET /api/v1/excel/template/download` - 下载导入模板

## 数据模型

### 用户表 (User)
- 支持管理员和班级账号两种角色
- 班级账号格式：年级-班级名

### 学生表 (Student)
- 学籍号、姓名、性别、民族、生日等基本信息
- 软删除机制

### 体测数据表 (SportData)
- 宽表设计，包含9项体测数据
- 自动计算总分和排名

### 班级表 (ClassInfo)
- 班级基本信息和学年管理

## 开发指南

### 项目结构

```
src/
├── app.ts              # 应用主文件
├── server.ts           # 服务启动文件
├── config/             # 配置文件
├── controllers/        # 控制器
├── middleware/         # 中间件
├── models/             # 数据模型
├── routes/             # 路由
├── services/           # 业务逻辑
├── types/              # 类型定义
└── utils/              # 工具函数
```

### 开发命令

```bash
npm run dev          # 开发模式（热重载）
npm run build        # 构建生产版本
npm start            # 启动生产服务
npm run lint         # 代码检查
npm test             # 运行测试
```

### 数据库迁移

```bash
npm run db:migrate   # 运行数据库迁移
npm run db:seed      # 运行数据种子
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t fitness-system-backend .

# 运行容器
docker run -p 3001:3001 --env-file .env fitness-system-backend
```

### 生产环境注意事项

1. 修改默认管理员密码
2. 设置强JWT密钥
3. 配置HTTPS
4. 设置合适的CORS策略
5. 配置日志轮转
6. 设置数据库连接池
7. 配置Redis持久化

## 默认账号

系统首次启动会自动创建默认管理员账号：
- 用户名: `admin`
- 密码: `admin123456`

**请在生产环境中立即修改默认密码！**

## 许可证

MIT License
