
## 体测数据处理模块使用说明

> 本文档适用于多人协作开发，介绍 `utils/data` 目录下所有导出内容及最佳实践。

---

### 目录结构

- `index.ts` 统一导出入口（推荐只用此文件导入）
- `studentData.ts` 学生体测数据处理类
- `gradeData.ts` 年级体测数据处理类
- 各项体测计算函数文件（如 `enduranceRun.ts`、`sitAndReach.ts` 等）
- `types.ts` 类型定义文件

---

### 导入方法

**推荐统一从 `index.ts` 导入所有功能：**

```typescript
import {
  StudentData,
  GradeData,
  calculateEnduranceRunScore,
  calculateRunning50mScore,
  calculateSitAndReachScore,
  calculateStandingLongJumpScore,
  calculateVitalCapacityScore,
  calculateSitUpAndPullUpScore,
  // 类型定义
  Gender,
  Grade,
  Level,
  ScoreData,
  GradeStats,
} from './utils/data';
```

---

### 主要导出内容

#### 1. 领域模型类

- **StudentData**
  - 用于单个学生体测数据的处理、成绩计算、历史分析
  - 常用方法：`getFullData()` (异步)、`getHistoryAnalysis()` (异步)、`getItemScore(itemKey)` (异步)

- **GradeData**
  - 用于年级整体体测数据统计、分项分析、趋势分析
  - 常用方法：`getGradeData()` (异步)、`getAnalyseScoreData()` (异步)、`getGradeHistoryAnalysis()` (异步)

#### 2. 体测成绩计算函数

- `calculateEnduranceRunScore`
- `calculateRunning50mScore`
- `calculateSitAndReachScore`
- `calculateStandingLongJumpScore`
- `calculateVitalCapacityScore`
- `calculateSitUpAndPullUpScore`

> 所有计算函数均为纯函数，参数为原始数据、性别、年级，返回分数和评级。

#### 3. 类型定义

- `Gender`, `Grade`, `Level` 等枚举类型
- `ScoreData`, `GradeStats`, `StudentHistoryAnalysis` 等接口
- 详见 `types.ts` 文件

---

### 使用示例

#### 1. 计算单个学生成绩

```typescript
const stu = new StudentData('张三', '20230001', 'male', 2025, 2);
const score = await stu.getFullData(); // 注意使用 await
console.log(score);
```

#### 2. 统计年级成绩

```typescript
const grade = new GradeData(2, 2025);
const stats = await grade.getGradeData(); // 注意使用 await
console.log(stats);
```

#### 3. 直接调用计算函数

```typescript
const result = calculateEnduranceRunScore(320, 'male', 2);
console.log(result); // { score: xx, level: '良好' }
```

#### 4. 异步方法使用

```typescript
// 获取学生历史分析（异步）
const historyAnalysis = await stu.getHistoryAnalysis();

// 获取单项成绩（异步）
const itemScore = await stu.getItemScore('erScore');

// 获取年级历史分析（异步）
const gradeHistory = await grade.getGradeHistoryAnalysis();
```

---

### 协作建议

- **统一入口**：所有导入建议只用 `index.ts`，避免直接引用子模块，便于后期维护和升级。
- **类型安全**：严格使用 `types.ts` 中定义的类型，减少类型错误。
- **异步处理**：涉及数据获取的方法都已改为异步，请使用 `async/await` 或 `.then()` 处理。
- **错误处理**：异步方法可能抛出异常，建议使用 `try/catch` 包裹调用。
- **单一职责**：如需扩展功能，建议新建文件并在 `index.ts` 统一导出。
- **文档同步**：如有新增导出或重要变更，请及时更新本 README。
