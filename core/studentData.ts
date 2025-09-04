import { calculateSitAndReachScore } from "./sitAndReach";
import { calculateEnduranceRunScore } from "./enduranceRun";
import { calculateRunning50mScore } from "./shortDistanceRunning";
import { calculateSitUpAndPullUpScore } from "./sitUpAndPullUp";
import { calculateStandingLongJumpScore } from "./standingLongJump";
import { calculateVitalCapacityScore } from "./vitalCapacity";
import {
  fetchStudentById,
  fetchStudentAvailableYears,
  fetchGradeAvailableYears,
  StudentRawData,
} from "./database";
import {
  Gender,
  Grade,
  Level,
  OriginData,
  ScoreData,
  TestItemConfig,
  ItemScoreDetail,
  StudentHistoryData,
  StudentHistoryAnalysis,
  ErrorResponse,
  TestItemKey,
} from "./types";

// 常驻内存缓存
const studentCalcCache = new Map<string, ScoreData>();
const studentHistoryCache = new Map<string, StudentHistoryAnalysis>();
const STUDENT_CACHE_TTL = 10 * 60 * 1000; // 10分钟TTL
const studentCacheTimestamps = new Map<string, number>();

// 性能配置
const STUDENT_PERFORMANCE_CONFIG = {
  MAX_HISTORY_PARALLEL: 3, // 历史数据最大并行数
  CACHE_SIZE_LIMIT: 500, // 缓存大小限制
};

// 测试项目配置常量
const SCORE_CALCULATORS = {
  erScore: {
    calculate: calculateEnduranceRunScore,
    dataKey: "longRun",
    name: "耐力跑",
  },
  sdrScore: {
    calculate: calculateRunning50mScore,
    dataKey: "shortRun",
    name: "50米跑",
  },
  sarScore: {
    calculate: calculateSitAndReachScore,
    dataKey: "sitAndReach",
    name: "坐位体前屈",
  },
  sljScore: {
    calculate: calculateStandingLongJumpScore,
    dataKey: "longJump",
    name: "立定跳远",
  },
  vcScore: {
    calculate: calculateVitalCapacityScore,
    dataKey: "vitalCapacity",
    name: "肺活量",
  },
  sapScore: {
    calculate: calculateSitUpAndPullUpScore,
    dataKey: "sitUpAndPullUp",
    name: "仰卧起坐/引体向上",
  },
} as const;

/**
 * 学生体测数据处理类
 */
export class StudentData {
  public name: string;
  public stu_id: string;
  public gender: Gender;
  public year: number;
  public grade_id: Grade;
  public cache_origin_data: OriginData;
  public cache_data: ScoreData;
  public history_data: StudentHistoryData[];
  private _cacheKey: string;
  private _historyCacheKey: string;

  /**
   * 学生体测数据处理类
   * @param name 学生姓名
   * @param stu_id 学生学号
   * @param gender 学生性别
   * @param year 查询指定年份数据
   * @param grade 年级
   */
  constructor(
    name: string,
    stu_id: string,
    gender: Gender,
    year?: number,
    grade?: Grade
  ) {
    this.name = name;
    this.stu_id = stu_id;
    this.gender = gender;
    this.year = year || new Date().getFullYear();
    this.grade_id = grade || 1;
    this.cache_origin_data = {};
    this.cache_data = {} as ScoreData;
    this.history_data = [];
    this._cacheKey = `${this.stu_id}_${this.year}`;
    this._historyCacheKey = `history_${this.stu_id}`;
  }

  /**
   * 检查缓存是否有效
   * @param key 缓存键
   * @returns 是否有效
   */
  private _isCacheValid(key: string): boolean {
    const timestamp = studentCacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < STUDENT_CACHE_TTL;
  }

  /**
   * 设置缓存时间戳
   * @param key 缓存键
   */
  private _setCacheTimestamp(key: string): void {
    studentCacheTimestamps.set(key, Date.now());
  }

  private async __getRemoteData(): Promise<void> {
    try {
      // 使用数据库接口获取学生数据
      const studentData = await fetchStudentById(this.stu_id, this.year);
      if (studentData) {
        // 转换为 OriginData 格式
        this.cache_origin_data = {
          longRun: studentData.longRun,
          shortRun: studentData.shortRun,
          sitAndReach: studentData.sitAndReach,
          longJump: studentData.longJump,
          vitalCapacity: studentData.vitalCapacity,
          sitUpAndPullUp: studentData.sitUpAndPullUp,
        };
        // 更新基本信息
        this.name = studentData.name;
        this.gender = studentData.gender;
      } else {
        console.warn(`获取学生${this.stu_id}的数据失败`);
        this.cache_origin_data = {};
      }
    } catch (error) {
      console.error("远程数据获取失败:", error);
      this.cache_origin_data = {};
    }
  }

  /**
   * 获取指定年份的学生体测数据和成绩
   * @returns 学生体测成绩数据
   */
  public async getFullData(): Promise<ScoreData> {
    // 1. 优先查内存缓存
    if (
      this._isCacheValid(this._cacheKey) &&
      studentCalcCache.has(this._cacheKey)
    ) {
      return studentCalcCache.get(this._cacheKey)!;
    }

    // 2. 获取原始数据
    if (Object.keys(this.cache_origin_data).length === 0) {
      await this.__getRemoteData();
    }

    if (Object.keys(this.cache_origin_data).length > 0) {
      // 使用优化的计算方法
      this.cache_data = this._calculateScoresOptimized();

      // 3. 写入内存缓存
      studentCalcCache.set(this._cacheKey, this.cache_data);
      this._setCacheTimestamp(this._cacheKey);

      // 内存管理
      this._manageMemory();
    }

    return this.cache_data;
  }

  /**
   * 内存管理方法
   */
  private _manageMemory(): void {
    if (studentCalcCache.size > STUDENT_PERFORMANCE_CONFIG.CACHE_SIZE_LIMIT) {
      const entries = Array.from(studentCacheTimestamps.entries());
      entries.sort((a, b) => a[1] - b[1]); // 按时间排序

      // 清理最老的20%
      const clearCount = Math.floor(entries.length * 0.2);
      for (let i = 0; i < clearCount; i++) {
        const [key] = entries[i];
        studentCalcCache.delete(key);
        studentHistoryCache.delete(key);
        studentCacheTimestamps.delete(key);
      }
    }
  }

  /**
   * 优化的成绩计算方法
   * @returns 计算后的成绩数据
   */
  private _calculateScoresOptimized(): ScoreData {
    const results = Object.entries(SCORE_CALCULATORS).map(([key, config]) => {
      try {
        const data = this.cache_origin_data[config.dataKey as keyof OriginData];
        if (data === undefined || data === null) {
          console.warn(`${config.name}数据缺失`);
          return { key, score: 0, level: "无数据" as Level };
        }
        const result = config.calculate(data, this.gender, this.grade_id);
        return {
          key,
          score: result?.score || 0,
          level: result?.level || ("无评级" as Level),
        };
      } catch (error) {
        console.error(`计算${config.name}成绩时出错:`, error);
        return { key, score: 0, level: "计算错误" as Level };
      }
    });

    // 构建成绩对象
    const scores: Partial<ScoreData> = {};
    const levels: Record<string, Level> = {};
    let totalScore = 0;

    results.forEach((result) => {
      (scores as any)[result.key] = result.score;
      levels[result.key.replace("Score", "Level")] = result.level;
      totalScore += result.score;
    });

    // 计算平均分和总体评级
    const testItemsCount = results.length;
    const avgScore = totalScore / testItemsCount;
    const overallLevel = this._calculateOverallLevel(avgScore);

    return {
      ...scores,
      ...levels,
      totalScore,
      avgScore: Math.round(avgScore * 100) / 100, // 保留两位小数
      overallLevel,
      year: this.year,
      testItemsCount,
    } as ScoreData;
  }

  /**
   * 计算总体评级
   * @param avgScore 平均分
   * @returns 评级
   * @private
   */
  private _calculateOverallLevel(avgScore: number): Level {
    // 评级标准配置
    const levelStandards = [
      { threshold: 85, level: "优秀" as Level },
      { threshold: 70, level: "良好" as Level },
      { threshold: 60, level: "及格" as Level },
    ];

    for (const standard of levelStandards) {
      if (avgScore >= standard.threshold) {
        return standard.level;
      }
    }
    return "不及格";
  }

  /**
   * 获取体测项目配置
   * @returns 体测项目配置数组
   * @private
   */
  private _getTestItemsConfig(): TestItemConfig[] {
    return [
      {
        key: "erScore",
        dataKey: "longRun",
        calculate: calculateEnduranceRunScore,
        name: "耐力跑",
      },
      {
        key: "sdrScore",
        dataKey: "shortRun",
        calculate: calculateRunning50mScore,
        name: "50米跑",
      },
      {
        key: "sarScore",
        dataKey: "sitAndReach",
        calculate: calculateSitAndReachScore,
        name: "坐位体前屈",
      },
      {
        key: "sljScore",
        dataKey: "longJump",
        calculate: calculateStandingLongJumpScore,
        name: "立定跳远",
      },
      {
        key: "vcScore",
        dataKey: "vitalCapacity",
        calculate: calculateVitalCapacityScore,
        name: "肺活量",
      },
      {
        key: "sapScore",
        dataKey: "sitUpAndPullUp",
        calculate: calculateSitUpAndPullUpScore,
        name: "仰卧起坐/引体向上",
      },
    ];
  }

  /**
   * 获取单项成绩详情
   * @param itemKey 项目键名
   * @returns 单项成绩详情
   */
  public async getItemScore(
    itemKey: TestItemKey
  ): Promise<ItemScoreDetail | null> {
    const fullData = await this.getFullData();
    if (!fullData || Object.keys(fullData).length === 0) {
      return null;
    }

    const testItems = this._getTestItemsConfig();
    const item = testItems.find((t) => t.key === itemKey);

    if (!item) {
      console.warn(`未找到项目: ${itemKey}`);
      return null;
    }

    return {
      name: item.name,
      score: fullData[item.key] || 0,
      level: (fullData as any)[item.key.replace("Score", "Level")] || "无评级",
      rawData: this.cache_origin_data[item.dataKey],
    };
  }

  /**
   * 获取学生历年体测数据分析
   * @returns 学生历年体测数据趋势分析
   */
  public async getHistoryAnalysis(): Promise<
    StudentHistoryAnalysis | ErrorResponse
  > {
    // 检查缓存
    if (
      this._isCacheValid(this._historyCacheKey) &&
      studentHistoryCache.has(this._historyCacheKey)
    ) {
      return studentHistoryCache.get(this._historyCacheKey)!;
    }

    if (this.history_data.length === 0) {
      await this.__getHistoryData();
    }

    if (this.history_data.length === 0) {
      return { error: "没有可用的历史数据" };
    }

    const analysis = this._analyzeHistoryOptimized();

    // 缓存结果
    studentHistoryCache.set(this._historyCacheKey, analysis);
    this._setCacheTimestamp(this._historyCacheKey);

    return analysis;
  }

  /**
   * 优化的历史数据分析方法
   * @returns 分析结果
   */
  private _analyzeHistoryOptimized(): StudentHistoryAnalysis {
    const analysis: StudentHistoryAnalysis = {
      years: [],
      categories: {
        erScore: [],
        sdrScore: [],
        sarScore: [],
        sljScore: [],
        vcScore: [],
        sapScore: [],
        totalScore: [],
        avgScore: [],
      },
      improvement: {},
      bestPerformance: { year: 0, score: 0 },
      worstPerformance: { year: 0, score: 100 },
      trend: "稳定",
      trajectory: [],
    };

    // 单次遍历收集所有数据
    this.history_data.forEach((data) => {
      analysis.years.push(data.year);

      // 批量收集分类数据
      const categories = [
        "erScore",
        "sdrScore",
        "sarScore",
        "sljScore",
        "vcScore",
        "sapScore",
        "totalScore",
        "avgScore",
      ] as const;
      categories.forEach((category) => {
        if (data[category] !== undefined) {
          (analysis.categories[category] as number[]).push(
            data[category] as number
          );
        }
      });

      // 更新最佳和最差成绩
      if (data.avgScore > analysis.bestPerformance.score) {
        analysis.bestPerformance = { year: data.year, score: data.avgScore };
      }
      if (data.avgScore < analysis.worstPerformance.score) {
        analysis.worstPerformance = { year: data.year, score: data.avgScore };
      }

      // 轨迹数据
      analysis.trajectory.push({ year: data.year, avgScore: data.avgScore });
    });

    // 批量计算改进情况和趋势
    if (this.history_data.length >= 2) {
      this._calculateImprovementsOptimized(analysis);
      analysis.trend = this._calculateOverallTrend(
        analysis.categories.avgScore
      );
    }

    return analysis;
  }

  /**
   * 优化的改进情况计算
   * @param analysis 分析数据
   */
  private _calculateImprovementsOptimized(
    analysis: StudentHistoryAnalysis
  ): void {
    const firstYear = this.history_data[0];
    const lastYear = this.history_data[this.history_data.length - 1];

    const categories = [
      "erScore",
      "sdrScore",
      "sarScore",
      "sljScore",
      "vcScore",
      "sapScore",
      "totalScore",
      "avgScore",
    ] as const;

    categories.forEach((category) => {
      if (
        firstYear[category] !== undefined &&
        lastYear[category] !== undefined
      ) {
        const firstValue = firstYear[category] as number;
        const lastValue = lastYear[category] as number;
        const change = lastValue - firstValue;
        const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;

        analysis.improvement[category] = {
          change,
          changePercent: parseFloat(changePercent.toFixed(2)),
          improved: change > 0,
        };
      }
    });
  }

  /**
   * 计算总体趋势
   * @param scores 分数数组
   * @returns 趋势
   */
  private _calculateOverallTrend(
    scores: number[]
  ): "上升" | "下降" | "稳定" | "波动" {
    if (scores.length < 2) return "稳定";

    let increasingCount = 0;
    let decreasingCount = 0;
    let stableCount = 0;
    const threshold = 0.5;

    for (let i = 1; i < scores.length; i++) {
      const diff = scores[i] - scores[i - 1];
      if (Math.abs(diff) < threshold) {
        stableCount++;
      } else if (diff > 0) {
        increasingCount++;
      } else {
        decreasingCount++;
      }
    }

    const totalChanges = scores.length - 1;
    const dominanceThreshold = totalChanges / 3;

    if (
      increasingCount > dominanceThreshold &&
      increasingCount > decreasingCount
    ) {
      return "上升";
    } else if (
      decreasingCount > dominanceThreshold &&
      decreasingCount > increasingCount
    ) {
      return "下降";
    } else if (stableCount > dominanceThreshold) {
      return "稳定";
    } else {
      return "波动";
    }
  }

  /**
   * 获取学生历年体测数据
   * @private
   */
  private async __getHistoryData(): Promise<void> {
    try {
      // 1. 先获取学生可用的年份数据
      const availableYears = await fetchStudentAvailableYears(this.stu_id);

      if (availableYears.length === 0) {
        console.warn(`学生${this.stu_id}没有可用的历史数据年份`);
        this.history_data = [];
        return;
      }

      // 2. 依次获取每年的数据并进行分析
      const historyDataPromises = availableYears.map(async (year) => {
        try {
          const yearNum = parseInt(year);
          const studentData = await fetchStudentById(this.stu_id, yearNum);

          if (!studentData) {
            console.warn(`获取学生${this.stu_id}在${year}年的数据失败`);
            return null;
          }

          // 计算该年的各项成绩
          const erScore = studentData.longRun
            ? calculateEnduranceRunScore(
                studentData.longRun,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;
          const sdrScore = studentData.shortRun
            ? calculateRunning50mScore(
                studentData.shortRun,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;
          const sarScore = studentData.sitAndReach
            ? calculateSitAndReachScore(
                studentData.sitAndReach,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;
          const sljScore = studentData.longJump
            ? calculateStandingLongJumpScore(
                studentData.longJump,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;
          const vcScore = studentData.vitalCapacity
            ? calculateVitalCapacityScore(
                studentData.vitalCapacity,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;
          const sapScore = studentData.sitUpAndPullUp
            ? calculateSitUpAndPullUpScore(
                studentData.sitUpAndPullUp,
                studentData.gender,
                this.grade_id
              )?.score || 0
            : 0;

          // 计算总分和平均分
          const scores = [
            erScore,
            sdrScore,
            sarScore,
            sljScore,
            vcScore,
            sapScore,
          ];
          const validScores = scores.filter((score) => score > 0);
          const totalScore = validScores.reduce((sum, score) => sum + score, 0);
          const avgScore =
            validScores.length > 0 ? totalScore / validScores.length : 0;

          return {
            year: yearNum,
            erScore,
            sdrScore,
            sarScore,
            sljScore,
            vcScore,
            sapScore,
            totalScore,
            avgScore: Math.round(avgScore * 100) / 100, // 保留两位小数
          };
        } catch (error) {
          console.error(`处理${year}年数据时出错:`, error);
          return null;
        }
      });

      // 3. 等待所有年份数据处理完成，过滤掉失败的数据
      const historyResults = await Promise.all(historyDataPromises);
      this.history_data = historyResults
        .filter((data) => data !== null)
        .sort((a, b) => a!.year - b!.year); // 按年份排序

      console.log(
        `成功获取学生${this.stu_id}的${this.history_data.length}年历史数据`
      );
    } catch (error) {
      console.error("历史数据获取失败:", error);
      this.history_data = [];
    }
  }

  /**
   * 获取学生可用数据年份
   * @returns 可用年份数组
   */
  public async getAvailableYears(): Promise<string[]> {
    return await fetchStudentAvailableYears(this.stu_id);
  }

  /**
   * 获取年级可用数据年份
   * @returns 可用年份数组
   */
  public async getGradeAvailableYears(): Promise<string[]> {
    return await fetchGradeAvailableYears(this.grade_id);
  }

  /**
   * 清理指定学生的内存缓存
   * @param stu_id 学生ID（可选，不传则清理当前学生）
   */
  public static clearCache(stu_id?: string): void {
    if (stu_id) {
      // 清理指定学生的所有年份缓存
      for (const key of studentCalcCache.keys()) {
        if (key.startsWith(`${stu_id}_`)) {
          studentCalcCache.delete(key);
          studentCacheTimestamps.delete(key);
        }
      }
      // 清理历史数据缓存
      const historyKey = `history_${stu_id}`;
      studentHistoryCache.delete(historyKey);
      studentCacheTimestamps.delete(historyKey);
    } else {
      // 清理全部缓存
      studentCalcCache.clear();
      studentHistoryCache.clear();
      studentCacheTimestamps.clear();
    }
  }

  /**
   * 静态方法：获取缓存统计信息
   */
  public static getCacheStats(): {
    calcCacheSize: number;
    historyCacheSize: number;
    totalMemoryUsage: number;
    oldestCacheAge: number;
  } {
    const now = Date.now();
    let oldestAge = 0;

    for (const timestamp of studentCacheTimestamps.values()) {
      const age = now - timestamp;
      if (age > oldestAge) {
        oldestAge = age;
      }
    }

    return {
      calcCacheSize: studentCalcCache.size,
      historyCacheSize: studentHistoryCache.size,
      totalMemoryUsage: studentCalcCache.size + studentHistoryCache.size,
      oldestCacheAge: Math.floor(oldestAge / 1000), // 转换为秒
    };
  }

  /**
   * 静态方法：批量预热学生缓存
   * @param studentIds 学生ID数组
   * @param years 年份数组
   */
  public static async preWarmCache(
    studentIds: string[],
    years: number[]
  ): Promise<void> {
    console.log(
      `开始预热学生缓存: ${studentIds.length}个学生, ${years.length}个年份`
    );

    const tasks = [];
    for (const studentId of studentIds) {
      for (const year of years) {
        tasks.push(async () => {
          const student = new StudentData(
            "",
            studentId,
            "male" as Gender,
            year,
            1
          );
          await student.getFullData();
        });
      }
    }

    // 分批执行预热任务
    const batchSize = STUDENT_PERFORMANCE_CONFIG.MAX_HISTORY_PARALLEL;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      await Promise.all(batch.map((task) => task()));

      // 避免过载
      if (i + batchSize < tasks.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("学生缓存预热完成");
  }

  /**
   * 静态方法：设置性能配置
   * @param config 性能配置
   */
  public static setPerformanceConfig(
    config: Partial<typeof STUDENT_PERFORMANCE_CONFIG>
  ): void {
    Object.assign(STUDENT_PERFORMANCE_CONFIG, config);
    console.log("学生性能配置已更新:", STUDENT_PERFORMANCE_CONFIG);
  }
}
