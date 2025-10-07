# MVP 开发计划

## 开发阶段规划

### 第一阶段：基础框架 (3-5天)
**目标**: 搭建基础项目结构，完成核心认证功能

#### 后端任务
- [ ] 初始化Express项目，配置Sequelize
- [ ] 设计数据库表结构
- [ ] 实现JWT认证中间件
- [ ] 完成用户登录/登出API
- [ ] 建立基础路由结构

#### 前端任务  
- [ ] 初始化Vue3项目，配置路由
- [ ] 设计基础布局组件
- [ ] 实现登录页面
- [ ] 配置axios和请求拦截器
- [ ] 实现路由守卫

#### 数据库设计
```sql
-- 用户表
users (id, username, password, role, class_name, grade, created_at, updated_at)

-- 学生表  
students (id, name, gender, class_name, grade, created_at, updated_at)

-- 评分标准表
standards (id, name, year, is_active, created_at, updated_at)

-- 评分规则表
standard_rules (id, standard_id, item, gender, unit, weight, direction, ranges_json)

-- 体测成绩表
fitness_scores (id, student_id, year, standard_id, total_score, items_json, created_at, updated_at)
```

### 第二阶段：学生管理 (3-4天)
**目标**: 完成学生信息的Excel导入功能

#### 后端任务
- [ ] Excel解析服务 (使用exceljs)
- [ ] Redis缓存预览数据
- [ ] 学生信息CRUD接口
- [ ] 数据校验和错误处理
- [ ] Excel模板生成接口

#### 前端任务
- [ ] 学生列表页面
- [ ] Excel上传组件
- [ ] 数据预览页面
- [ ] 错误信息展示
- [ ] 确认录入流程

#### 关键功能
- Excel文件上传和解析
- 数据格式校验
- 预览确认机制
- 批量导入学生信息

### 第三阶段：评分系统 (4-5天)
**目标**: 实现评分标准管理和成绩计算

#### 后端任务
- [ ] 评分标准CRUD接口
- [ ] 评分计算引擎
- [ ] 成绩排名计算
- [ ] 数据重算服务
- [ ] 默认标准初始化

#### 前端任务
- [ ] 评分标准管理页面
- [ ] 成绩列表和详情页面
- [ ] 成绩录入页面
- [ ] 计算结果展示

#### 核心算法
```javascript
// 评分计算核心逻辑
function calculateScore(rawValue, rules, direction) {
  // 根据原始值匹配分数区间
  for (const rule of rules) {
    if (isInRange(rawValue, rule.min, rule.max)) {
      return rule.score;
    }
  }
  return 0;
}

function calculateTotalScore(studentData, standard) {
  let totalScore = 0;
  for (const item of studentData.items) {
    const rule = standard.rules.find(r => r.item === item.name && r.gender === studentData.gender);
    const score = calculateScore(item.value, rule.ranges, rule.direction);
    totalScore += score * rule.weight;
  }
  return totalScore;
}
```

### 第四阶段：数据分析 (3-4天)  
**目标**: 基础数据统计和图表展示

#### 后端任务
- [ ] 统计分析接口
- [ ] 排名计算服务
- [ ] 趋势数据接口
- [ ] Excel导出功能

#### 前端任务
- [ ] 数据看板页面
- [ ] ECharts图表集成
- [ ] 统计数据展示
- [ ] Excel导出功能

#### 图表类型
- 班级成绩分布柱状图
- 个人成绩雷达图
- 历年趋势折线图
- 排名对比表格

## 技术要点

### 关键依赖
**后端**:
```json
{
  "express": "^4.18.0",
  "sequelize": "^6.28.0", 
  "pg": "^8.8.0",
  "redis": "^4.5.0",
  "jsonwebtoken": "^9.0.0",
  "exceljs": "^4.3.0",
  "multer": "^1.4.5"
}
```

**前端**:
```json
{
  "vue": "^3.3.0",
  "vue-router": "^4.2.0",
  "pinia": "^2.1.0",
  "element-plus": "^2.3.0",
  "echarts": "^5.4.0",
  "axios": "^1.4.0"
}
```

### 部署配置
- 使用Docker容器化部署
- PostgreSQL和Redis使用Docker Compose
- 前端打包后通过Nginx代理
- 后端PM2进程管理

## 测试数据

### 示例班级账号
```
用户名: 2024-高三一班
密码: class123456

用户名: admin  
密码: admin123456
```

### 示例学生数据
```excel
姓名    性别  班级      身高  体重  肺活量  50米跑  立定跳远  坐位体前屈  长跑   力量项目
张三    男    高三一班  175   65    4000    7.2     2.35      18        210    15
李四    女    高三一班  165   55    3200    8.1     1.85      22        180    45
```

### 默认评分标准
**男生身高评分 (权重5%)**:
- 180cm以上: 100分
- 175-179cm: 95分  
- 170-174cm: 85分
- 165-169cm: 75分
- 164cm以下: 60分

## 开发规范

### 代码规范
- ESLint + Prettier格式化
- 统一的错误处理机制
- API响应格式标准化
- 数据库事务处理

### Git工作流
- main分支保护
- feature分支开发
- 代码审查制度
- 自动化测试集成

### 项目结构
```
fitness-system-v2/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── routes/
│   ├── config/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── store/
│   │   └── api/
│   └── public/
└── docs/
```

## 里程碑检查点

### 第一阶段完成标准
- [ ] 管理员和班级账号能正常登录
- [ ] 前后端认证流程完整
- [ ] 基础页面路由正常

### 第二阶段完成标准  
- [ ] Excel模板能正常下载
- [ ] 上传Excel能正确解析和预览
- [ ] 学生数据能成功录入数据库

### 第三阶段完成标准
- [ ] 评分标准能正常配置
- [ ] 成绩计算结果准确
- [ ] 排名功能正常工作

### 第四阶段完成标准
- [ ] 基础统计图表能正常显示
- [ ] Excel导出功能正常
- [ ] 系统整体流程可用

## 风险评估

### 技术风险
- Excel解析复杂度可能超预期
- 大数据量下的性能问题
- 评分计算逻辑的准确性

### 解决方案
- 提前验证Excel解析库
- 使用Redis缓存提升性能
- 编写充分的单元测试