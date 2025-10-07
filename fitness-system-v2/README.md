# 学生体测管理系统 v2.0

> 重写版学生体测管理系统，基于 Vue3 + Express + PostgreSQL

## 项目结构

```
fitness-system-v2/
├── docs/                   # 项目文档
│   ├── requirements.md     # 需求文档  
│   ├── api.md             # API接口文档
│   ├── mvp-plan.md        # MVP开发计划
│   └── README.md          # 项目说明
├── backend/               # 后端代码
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务服务
│   │   ├── middlewares/   # 中间件
│   │   ├── routes/        # 路由
│   │   └── app.js         # 应用入口
│   ├── config/            # 配置文件
│   ├── tests/             # 测试文件
│   └── package.json
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面组件
│   │   ├── store/         # 状态管理
│   │   ├── api/           # API接口
│   │   ├── router/        # 路由配置
│   │   └── main.js        # 应用入口
│   ├── public/            # 静态资源
│   └── package.json
└── docker-compose.yml     # Docker配置
```

## 快速开始

### 环境要求
- Node.js >= 16.0
- PostgreSQL >= 13.0  
- Redis >= 6.0

### 开发环境搭建

1. **启动数据库服务**
```bash
docker-compose up -d postgres redis
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接
```

4. **数据库初始化**
```bash
npm run db:migrate
npm run db:seed
```

5. **启动后端服务**
```bash
npm run dev
```

6. **安装前端依赖**
```bash
cd ../frontend
npm install
```

7. **启动前端服务**
```bash
npm run dev
```

### 默认账号

**管理员账号**:
- 用户名: admin
- 密码: admin123456

**班级账号示例**:
- 用户名: 2024-高三一班
- 密码: class123456

## 功能模块

### 🔐 认证授权
- JWT Token认证
- 角色权限控制
- 路由守卫

### 👥 学生管理
- Excel批量导入学生信息
- 数据预览和校验
- 学生信息维护

### 📊 评分标准
- 可配置的评分标准
- 多版本标准管理
- 自动成绩计算

### 📈 数据分析
- 多维度统计分析
- 可视化图表展示
- 历史趋势对比

### 📤 数据导出
- Excel格式导出
- 多维度数据筛选
- 自定义报表格式

## 技术栈

### 后端
- **框架**: Express.js
- **ORM**: Sequelize  
- **数据库**: PostgreSQL + Redis
- **认证**: JWT
- **文件处理**: ExcelJS
- **其他**: Multer, Helmet, CORS

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia  
- **UI组件**: Element Plus
- **图表库**: ECharts
- **HTTP客户端**: Axios

## 开发规范

### 代码规范
- ESLint + Prettier
- 统一的错误处理
- RESTful API设计
- 组件化开发

### Git工作流
- 功能分支开发
- 代码审查流程
- 语义化提交信息

### 测试规范
- 单元测试覆盖
- API接口测试
- E2E测试

## 部署说明

### Docker部署
```bash
# 构建和启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境配置
- 使用PM2管理后端进程
- Nginx代理前端静态文件
- 数据库连接池配置
- Redis集群配置

## API文档

详细的API接口文档请查看 [docs/api.md](./docs/api.md)

主要接口包括:
- 认证相关: `/api/v1/auth/*`
- 学生管理: `/api/v1/students/*`
- 评分标准: `/api/v1/standards/*`
- 成绩管理: `/api/v1/scores/*`
- 数据分析: `/api/v1/analysis/*`
- 数据导出: `/api/v1/export/*`

## 开发计划

当前版本按MVP模式开发，分为4个阶段:

1. **基础框架** (3-5天) - 认证系统和基础结构
2. **学生管理** (3-4天) - Excel导入和学生信息管理
3. **评分系统** (4-5天) - 评分标准配置和成绩计算
4. **数据分析** (3-4天) - 统计分析和图表展示

详细开发计划请查看 [docs/mvp-plan.md](./docs/mvp-plan.md)

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系:
- 创建 Issue
- 邮件联系项目维护者

---

**注意**: 这是v2.0重写版本，与之前的版本不兼容。如需数据迁移，请联系项目维护者。