# 体测数据处理模块 - TypeScript 版本

这是体测数据处理模块的 TypeScript 重构版本，提供了完整的类型安全支持和现代化的代码架构。

## 文件结构

```
utils/data/
├── types.ts                    # 类型定义文件
├── index.ts                    # 主要数据处理类 (StudentData, GradeData)
├── enduranceRun.ts            # 耐力跑计算
├── shortDistanceRunning.ts    # 50米跑计算
├── sitAndReach.ts            # 坐位体前屈计算
├── standingLongJump.ts       # 立定跳远计算
├── vitalCapacity.ts          # 肺活量计算
├── sitUpAndPullUp.ts         # 仰卧起坐/引体向上计算
├── data.ts                   # 统一导出文件
└── README.md                 # 使用说明
```

## 主要改进

### 1. **类型安全**
- 完整的 TypeScript 类型定义
- 强类型检查，减少运行时错误
- 智能代码提示和自动补全

### 2. **现代化语法**
- ES6+ 模块导入/导出
- 类的访问修饰符 (public, private)
- 接口和类型别名
- 泛型支持

### 3. **代码组织**
- 清晰的模块划分
- 统一的错误处理
- 标准化的函数签名

### 4. **性能优化**
- 一次遍历完成所有统计
- 按有效数据人数计算平均分
- 性别分项统计优化

## 使用示例

### 基本用法

```typescript
import { StudentData, GradeData, calculateEnduranceRunScore } from './utils/data/data';

// 1. 单项计算
const result = calculateEnduranceRunScore(220, 'male', 1);
console.log(result); // { score: 90, level: "优秀" }

// 2. 学生数据处理
const student = new StudentData("张三", "2021001", "male", 2023, 1);
const fullData = student.getFullData();
const historyAnalysis = student.getHistoryAnalysis();

// 3. 年级数据处理
const grade = new GradeData(1, 2023);
const gradeStats = grade.getGradeData();
const historyAnalysis = grade.getGradeHistoryAnalysis();
```

### 类型安全示例

```typescript
import { Gender, Grade, CalculateResult } from './utils/data/types';

// 类型安全的函数参数
function processStudentData(
  name: string,
  gender: Gender,    // 只能是 'male' | 'female'
  grade: Grade       // 只能是 1 | 2 | 3
) {
  // TypeScript 会确保参数类型正确
  const student = new StudentData(name, "2021001", gender, 2023, grade);
  return student.getFullData();
}

// 类型安全的返回值
function calculateScore(seconds: number): CalculateResult | null {
  return calculateEnduranceRunScore(seconds, 'male', 1);
}
```

## 主要功能

### StudentData 类
- `getFullData()`: 获取学生完整体测成绩
- `getItemScore(itemKey)`: 获取单项成绩详情
- `getHistoryAnalysis()`: 获取历年成绩趋势分析

### GradeData 类
- `getGradeData()`: 获取年级统计数据（包含性别分项）
- `getAnalyseScoreData()`: 获取成绩分析
- `getGradeHistoryAnalysis()`: 获取历年趋势分析

### 计算函数
- `calculateEnduranceRunScore()`: 耐力跑
- `calculateRunning50mScore()`: 50米跑
- `calculateSitAndReachScore()`: 坐位体前屈
- `calculateStandingLongJumpScore()`: 立定跳远
- `calculateVitalCapacityScore()`: 肺活量
- `calculateSitUpAndPullUpScore()`: 仰卧起坐/引体向上

## 新增功能

### 1. 性别分项分析
```typescript
const gradeStats = grade.getGradeData();
console.log(gradeStats.genderStats.male.averageScores);    // 男生各项平均分
console.log(gradeStats.genderStats.female.weakestCategories); // 女生弱项
```

### 2. 个体成长轨迹
```typescript
const analysis = student.getHistoryAnalysis();
console.log(analysis.trajectory); // 历年平均分轨迹
console.log(analysis.improvement); // 各项目进步情况
```

### 3. 优化的算法逻辑
- 时间复杂度从多次 O(n) 降至一次 O(n)
- 按有效数据人数计算平均分
- 内存使用优化

## 迁移指南

### 从 JavaScript 版本迁移

1. **更新导入语句**
```typescript
// 旧版本 (JS)
const { StudentData, GradeData } = require('./utils/data/index.js');

// 新版本 (TS)
import { StudentData, GradeData } from './utils/data/data';
```

2. **添加类型注解**
```typescript
// 为函数参数和返回值添加类型
function processData(studentId: string, grade: Grade): ScoreData {
  // ...
}
```

3. **使用接口和类型**
```typescript
import { GradeStats, StudentHistoryAnalysis } from './utils/data/types';

const stats: GradeStats = grade.getGradeData();
```
