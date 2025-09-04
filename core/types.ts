// 体测数据相关类型定义

/** 性别类型 */
export type Gender = "male" | "female";

/** 年级类型 */
export type Grade = 1 | 2 | 3;

/** 评级类型 */
export type Level =
  | "优秀"
  | "良好"
  | "及格"
  | "不及格"
  | "无评级"
  | "无数据"
  | "计算错误";

/** 趋势类型 */
export type Trend = "上升" | "下降" | "稳定" | "波动";

/** 体测项目键名 */
export type TestItemKey =
  | "erScore"
  | "sdrScore"
  | "sarScore"
  | "sljScore"
  | "vcScore"
  | "sapScore";

/** 原始体测数据 */
export interface OriginData {
  longRun?: number; // 耐力跑(秒)
  shortRun?: number; // 50米跑(秒)
  sitAndReach?: number; // 坐位体前屈(cm)
  longJump?: number; // 立定跳远(cm)
  vitalCapacity?: number; // 肺活量(ml)
  sitUpAndPullUp?: number; // 仰卧起坐/引体向上(次)
}

/** 体测分数数据 */
export interface ScoreData {
  erScore: number; // 耐力跑分数
  sdrScore: number; // 50米跑分数
  sarScore: number; // 坐位体前屈分数
  sljScore: number; // 立定跳远分数
  vcScore: number; // 肺活量分数
  sapScore: number; // 仰卧起坐/引体向上分数
  erLevel?: Level; // 耐力跑评级
  sdrLevel?: Level; // 50米跑评级
  sarLevel?: Level; // 坐位体前屈评级
  sljLevel?: Level; // 立定跳远评级
  vcLevel?: Level; // 肺活量评级
  sapLevel?: Level; // 仰卧起坐/引体向上评级
  totalScore: number; // 总分
  avgScore: number; // 平均分
  overallLevel: Level; // 总体评级
  year: number; // 年份
  testItemsCount: number; // 测试项目数量
}

/** 体测计算结果 */
export interface CalculateResult {
  score: number;
  level: Level;
}

/** 体测项目配置 */
export interface TestItemConfig {
  key: TestItemKey;
  dataKey: keyof OriginData;
  calculate: (
    value: number,
    gender: Gender,
    grade: Grade
  ) => CalculateResult | null;
  name: string;
}

/** 单项成绩详情 */
export interface ItemScoreDetail {
  name: string;
  score: number;
  level: Level;
  rawData?: number;
}

/** 学生历史数据 */
export interface StudentHistoryData {
  year: number;
  erScore: number;
  sdrScore: number;
  sarScore: number;
  sljScore: number;
  vcScore: number;
  sapScore: number;
  totalScore: number;
  avgScore: number;
}

/** 项目改善情况 */
export interface ImprovementData {
  change: number;
  changePercent: number;
  improved: boolean;
}

/** 年度表现 */
export interface PerformanceData {
  year: number;
  score: number;
}

/** 学生历史分析结果 */
export interface StudentHistoryAnalysis {
  years: number[];
  categories: {
    erScore: number[];
    sdrScore: number[];
    sarScore: number[];
    sljScore: number[];
    vcScore: number[];
    sapScore: number[];
    totalScore: number[];
    avgScore: number[];
  };
  improvement: Record<string, ImprovementData>;
  bestPerformance: PerformanceData;
  worstPerformance: PerformanceData;
  trend: Trend;
  trajectory: Array<{ year: number; avgScore: number }>;
}

/** 年级分数统计 */
export interface GradeAverageScores {
  erScore: number;
  sdrScore: number;
  sarScore: number;
  sljScore: number;
  vcScore: number;
  sapScore: number;
  total: number;
  average: number;
}

/** 年级级别分布 */
export interface GradeLevelDistribution {
  excellent: number;
  good: number;
  pass: number;
  fail: number;
}

/** 年级性别分布 */
export interface GradeGenderDistribution {
  male: number;
  female: number;
}

/** 顶尖学生信息 */
export interface TopStudent {
  id: string;
  name: string;
  totalScore: number;
}

/** 单项前5名学生信息 */
export interface CategoryTopStudent {
  id: string;
  name: string;
  score: number;
  level: Level;
  rawData?: number;
}

/** 各项目前5名学生 */
export interface CategoryTopStudents {
  erScore: CategoryTopStudent[]; // 耐力跑前5名
  sdrScore: CategoryTopStudent[]; // 50米跑前5名
  sarScore: CategoryTopStudent[]; // 坐位体前屈前5名
  sljScore: CategoryTopStudent[]; // 立定跳远前5名
  vcScore: CategoryTopStudent[]; // 肺活量前5名
  sapScore: CategoryTopStudent[]; // 仰卧起坐/引体向上前5名
}

/** 弱项分类 */
export interface WeakCategory {
  name: string;
  score: number;
}

/** 性别统计数据 */
export interface GenderStats {
  averageScores: GradeAverageScores;
  weakestCategories: WeakCategory[];
}

/** 年级统计数据 */
export interface GradeStats {
  totalStudents: number;
  genderDistribution: GradeGenderDistribution;
  averageScores: GradeAverageScores;
  levelDistribution: GradeLevelDistribution;
  topStudents: TopStudent[]; // 总分前5名
  categoryTopStudents: CategoryTopStudents; // 各项目前5名
  weakestCategories: WeakCategory[];
  genderStats: {
    male: GenderStats;
    female: GenderStats;
  };
}

/** 年级历史分析数据 */
export interface GradeHistoryAnalysis {
  years: number[];
  averageScores: {
    erScore: number[];
    sdrScore: number[];
    sarScore: number[];
    sljScore: number[];
    vcScore: number[];
    sapScore: number[];
    average: number[];
  };
  levelDistribution: Record<string, GradeLevelDistribution>;
  improvement: Record<string, ImprovementData>;
  trends: Record<string, Trend>;
}

/** 标准分数等级 */
export interface ScoreStandard {
  score: number;
  value: number;
}

/** 体测项目标准数据 */
export interface TestStandard {
  male: {
    grade1: ScoreStandard[];
    grade2: ScoreStandard[];
    grade3: ScoreStandard[];
  };
  female: {
    grade1: ScoreStandard[];
    grade2: ScoreStandard[];
    grade3: ScoreStandard[];
  };
}

/** 错误响应 */
export interface ErrorResponse {
  error: string;
}
