# 体质测试数据管理系统

![版本](https://img.shields.io/badge/版本-0.1.0--alpha-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![Express](https://img.shields.io/badge/Express-v4.18+-lightgrey)
![Sequelize](https://img.shields.io/badge/Sequelize-v6+-orange)
![开发状态](https://img.shields.io/badge/状态-开发中-yellow)

## 项目概述

体质测试数据管理系统是一个专为学校和教育机构设计的全功能平台，用于收集、管理、分析和可视化学生体质测试数据。该系统提供直观的界面和强大的分析工具，帮助教育工作者追踪学生体质健康状况，制定针对性的改进计划。

> ⚠️ **注意**: 本项目目前处于积极开发阶段，功能和API可能会发生变化。

## 主要功能

- **学生数据管理**: 存储和管理学生基本信息
- **体测数据采集**: 支持多种体测项目数据的录入和导入
- **多维度数据分析**: 按年级、班级、性别等多维度分析体测结果
- **数据可视化**: 直观图表展示体测成绩分布和趋势
- **成绩评定**: 自动根据国家标准评定体测等级
- **统计报告**: 生成综合统计报告和分析文档
- **用户权限管理**: 多级权限控制，保障数据安全

## 技术栈

### 后端

- Node.js + Express
- Sequelize ORM
- MySQL/PostgreSQL
- JWT 认证
- REST API

### 前端 (独立仓库)

- Vue.js
- Tailwind CSS
- ECharts
- Axios

## 系统架构

```
+------------------+       +------------------+      +------------------+
|                  |       |                  |      |                  |
|     客户端        |<----->|    API服务器      |<---->|     数据库        |
|     (VUE)        |  HTTP |    (Express)     |  SQL |    (MySQL)       |
|                  |       |                  |      |                  |
+------------------+       +------------------+      +------------------+
```

## 数据模型

系统主要包含以下数据模型：

- **User**: 系统用户（管理员、教师等）
- **StudentInfo**: 学生基本信息
- **ClassInfo**: 班级信息
- **SportData**: 体测数据记录
- **StandardData**: 国家体测标准数据

## 项目安装与运行

### 环境要求

- Node.js >= 16.0.0
- MySQL/MariaDB >= 5.7 或 PostgreSQL >= 9.6
- npm >= 7.0.0

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/The-ESAP-Project/sport-management.git
cd sport-management
```

2. 安装依赖

```bash
yarn install
```

3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置数据库连接等参数
```

4. 启动开发服务器

```bash
yarn dev
```

### 生产环境部署

```bash
# 构建项目
yarn build

# 启动生产服务器
yarn start
```

## API 文档

API 端点遵循 RESTful 设计原则，主要分为以下几类：

- **/api/v1/auth** - 认证相关
- **/api/v1/user** - 用户管理
- **/api/v1/student** - 学生数据
- **/api/v1/class** - 班级管理
- **/api/v1/sport** - 体测数据
- **/api/v1/report** - 报告生成
- **/api/v1/superadmin** - 超级管理员功能

## 安全特性

- JWT 令牌认证
- 请求速率限制
- 参数验证和消毒
- 角色基础的权限控制
- HTTPS 支持
- 密码哈希存储

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 开发路线图

- [x] 用户认证系统
- [x] 基础数据模型设计
- [x] API基础框架
- [ ] 学生信息管理
- [ ] 体测数据录入与管理
- [ ] 数据分析与统计
- [ ] 报表生成功能
- [ ] 批量导入/导出
- [ ] 前端界面集成

## 许可证

GPL-3.0 License

## 联系方式

项目维护者: AptS:1547 & Cloudwhile

---

© 2025 AptS:1547 & Cloudwhile. 版权所有
