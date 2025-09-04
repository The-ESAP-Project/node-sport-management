import {
  fetchAvailableYears,
  fetchGradeAvailableYears,
  fetchStudentData,
  CONST_SIZE,
  StudentRawData,
  PagedResult,
} from "./database";
import {
  Grade,
  GradeStats,
  GradeHistoryAnalysis,
  ErrorResponse,
  Trend,
  CategoryTopStudents,
  Level,
} from "./types";
import { calculateSitAndReachScore } from "./sitAndReach";
import { calculateEnduranceRunScore } from "./enduranceRun";
import { calculateRunning50mScore } from "./shortDistanceRunning";
import { calculateSitUpAndPullUpScore } from "./sitUpAndPullUp";
import { calculateStandingLongJumpScore } from "./standingLongJump";
import { calculateVitalCapacityScore } from "./vitalCapacity";

// 全局缓存管理
const gradeDataCache = new Map<string, GradeStats>();
const historyDataCache = new Map<string, GradeHistoryAnalysis>();
const studentDataCache = new Map<string, StudentRawData[]>();

// 缓存TTL管理 (5分钟)
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

// 性能配置
const PERFORMANCE_CONFIG = {
  MAX_PARALLEL_REQUESTS: 5, // 最大并发请求数
  BATCH_SIZE: 100, // 批处理大小
  MEMORY_LIMIT: 1000, // 内存限制（学生数量）
};

// 测试项目常量
const TEST_CATEGORIES = [
  "erScore",
  "sdrScore",
  "sarScore",
  "sljScore",
  "vcScore",
  "sapScore",
] as const;
const CATEGORY_NAMES = {
  erScore: "耐力跑",
  sdrScore: "50米跑",
  sarScore: "坐位体前屈",
  sljScore: "立定跳远",
  vcScore: "肺活量",
  sapScore: "仰卧起坐/引体向上",
} as const;

/**
 * 年级体测数据处理类
 */
export class GradeData {
  public grade_id: Grade;
  public year: number;
  public data: Record<string, any>;
  public standard: Record<string, number>;
  public history_data: Record<string, any>;
  private _cacheKey: string;
  private _historyCacheKey: string;

  /**
   * 年级体测数据处理类
   * @param grade_id 年级
   * @param year 查询年份
   */
  constructor(grade_id: Grade, year?: number) {
    this.grade_id = grade_id;
    this.year = year || new Date().getFullYear();
    this.data = {};
    this.standard = {};
    this.history_data = {};
    this._cacheKey = `grade_${grade_id}_${this.year}`;
    this._historyCacheKey = `grade_history_${grade_id}`;
  }

  /**
   * 检查缓存是否有效
   * @param key 缓存键
   * @returns 是否有效
   */
  private _isCacheValid(key: string): boolean {
    const timestamp = cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
  }

  /**
   * 设置缓存时间戳
   * @param key 缓存键
   */
  private _setCacheTimestamp(key: string): void {
    cacheTimestamps.set(key, Date.now());
  }

  /**
   * 批量获取学生数据
   * @returns 学生数据数组
   */
  private async __getRemoteDataOptimized(): Promise<StudentRawData[]> {
    // 检查缓存
    const cacheKey = `students_${this.grade_id}_${this.year}`;
    if (this._isCacheValid(cacheKey) && studentDataCache.has(cacheKey)) {
      return studentDataCache.get(cacheKey)!;
    }

    try {
      const allStudents: StudentRawData[] = [];
      let page = 1;
      let total = 0;

      // 并发获取数据，但限制并发数
      const fetchPromises: Promise<PagedResult<StudentRawData>>[] = [];

      // 先获取第一页来确定总数
      const firstResult = await fetchStudentData(
        this.grade_id,
        this.year.toString(),
        1,
        CONST_SIZE
      );

      allStudents.push(...firstResult.data);
      total = firstResult.total;

      if (total > CONST_SIZE) {
        const totalPages = Math.ceil(total / CONST_SIZE);

        // 分批并发获取剩余页面
        for (
          let batchStart = 2;
          batchStart <= totalPages;
          batchStart += PERFORMANCE_CONFIG.MAX_PARALLEL_REQUESTS
        ) {
          const batchEnd = Math.min(
            batchStart + PERFORMANCE_CONFIG.MAX_PARALLEL_REQUESTS - 1,
            totalPages
          );

          const batchPromises = [];
          for (let p = batchStart; p <= batchEnd; p++) {
            batchPromises.push(
              fetchStudentData(
                this.grade_id,
                this.year.toString(),
                p,
                CONST_SIZE
              )
            );
          }

          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach((result) => allStudents.push(...result.data));
        }
      }

      // 缓存结果
      studentDataCache.set(cacheKey, allStudents);
      this._setCacheTimestamp(cacheKey);

      return allStudents;
    } catch (error) {
      console.error("批量获取学生数据失败:", error);
      return [];
    }
  }

  /**
   * 获取远程数据
   */
  private async __getRemoteData(): Promise<void> {
    try {
      const allStudents = await this.__getRemoteDataOptimized();

      // 使用高效的数据结构转换
      this.data = Object.create(null); // 创建无原型对象，提高性能

      // 批量处理数据转换
      if (allStudents.length > PERFORMANCE_CONFIG.BATCH_SIZE) {
        // 大数据集分批处理
        for (
          let i = 0;
          i < allStudents.length;
          i += PERFORMANCE_CONFIG.BATCH_SIZE
        ) {
          const batch = allStudents.slice(i, i + PERFORMANCE_CONFIG.BATCH_SIZE);
          this._processBatch(batch);
        }
      } else {
        // 小数据集直接处理
        this._processBatch(allStudents);
      }
    } catch (error) {
      console.error("年级数据获取失败:", error);
      this.data = {};
    }
  }

  /**
   * 批量处理学生数据
   * @param students 学生数据批次
   */
  private _processBatch(students: StudentRawData[]): void {
    students.forEach((student) => {
      // 计算各项成绩
      const scores = this._calculateStudentScores(student);

      this.data[student.stu_id] = {
        stu_id: student.stu_id,
        name: student.name,
        gender: student.gender,
        data: {
          // 原始数据
          longRun: student.longRun,
          shortRun: student.shortRun,
          sitAndReach: student.sitAndReach,
          longJump: student.longJump,
          vitalCapacity: student.vitalCapacity,
          sitUpAndPullUp: student.sitUpAndPullUp,
          // 计算的成绩
          ...scores,
        },
      };
    });
  }

  /**
   * 计算学生各项成绩
   * @param student 学生原始数据
   * @returns 计算后的成绩
   */
  private _calculateStudentScores(
    student: StudentRawData
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    try {
      // 耐力跑
      if (student.longRun) {
        const erResult = calculateEnduranceRunScore(
          student.longRun,
          student.gender,
          this.grade_id
        );
        scores.erScore = erResult?.score || 0;
      } else {
        scores.erScore = 0;
      }

      // 50米跑
      if (student.shortRun) {
        const sdrResult = calculateRunning50mScore(
          student.shortRun,
          student.gender,
          this.grade_id
        );
        scores.sdrScore = sdrResult?.score || 0;
      } else {
        scores.sdrScore = 0;
      }

      // 坐位体前屈
      if (student.sitAndReach) {
        const sarResult = calculateSitAndReachScore(
          student.sitAndReach,
          student.gender,
          this.grade_id
        );
        scores.sarScore = sarResult?.score || 0;
      } else {
        scores.sarScore = 0;
      }

      // 立定跳远
      if (student.longJump) {
        const sljResult = calculateStandingLongJumpScore(
          student.longJump,
          student.gender,
          this.grade_id
        );
        scores.sljScore = sljResult?.score || 0;
      } else {
        scores.sljScore = 0;
      }

      // 肺活量
      if (student.vitalCapacity) {
        const vcResult = calculateVitalCapacityScore(
          student.vitalCapacity,
          student.gender,
          this.grade_id
        );
        scores.vcScore = vcResult?.score || 0;
      } else {
        scores.vcScore = 0;
      }

      // 仰卧起坐/引体向上
      if (student.sitUpAndPullUp) {
        const sapResult = calculateSitUpAndPullUpScore(
          student.sitUpAndPullUp,
          student.gender,
          this.grade_id
        );
        scores.sapScore = sapResult?.score || 0;
      } else {
        scores.sapScore = 0;
      }
    } catch (error) {
      console.error(`计算学生${student.stu_id}成绩时出错:`, error);
      // 如果计算失败，设置默认值
      scores.erScore = 0;
      scores.sdrScore = 0;
      scores.sarScore = 0;
      scores.sljScore = 0;
      scores.vcScore = 0;
      scores.sapScore = 0;
    }

    return scores;
  }

  /**
   * 获取年级指定年份的体测数据和成绩（高度优化版）
   * @returns 年级体测成绩数据
   */
  public async getGradeData(): Promise<GradeStats | ErrorResponse> {
    // 检查缓存
    if (
      this._isCacheValid(this._cacheKey) &&
      gradeDataCache.has(this._cacheKey)
    ) {
      return gradeDataCache.get(this._cacheKey)!;
    }

    if (Object.keys(this.data).length === 0) {
      await this.__getRemoteData();
    }

    const studentsArray = Object.values(this.data);
    const totalStudents = studentsArray.length;

    if (totalStudents === 0) {
      return { error: "没有可用的年级数据" };
    }

    // 使用单次遍历计算所有统计数据
    const stats = this._calculateStatsOptimized(studentsArray, totalStudents);

    // 缓存结果
    gradeDataCache.set(this._cacheKey, stats);
    this._setCacheTimestamp(this._cacheKey);

    return stats;
  }

  /**
   * 优化的统计计算方法
   * @param studentsArray 学生数组
   * @param totalStudents 学生总数
   * @returns 统计结果
   */
  private _calculateStatsOptimized(
    studentsArray: any[],
    totalStudents: number
  ): GradeStats {
    // 初始化累加器
    const accumulator = {
      scoreSum: Object.fromEntries(
        TEST_CATEGORIES.map((cat) => [cat, 0])
      ) as Record<string, number>,
      validCount: Object.fromEntries(
        TEST_CATEGORIES.map((cat) => [cat, 0])
      ) as Record<string, number>,
      genderSum: {
        male: Object.fromEntries(
          TEST_CATEGORIES.map((cat) => [cat, 0])
        ) as Record<string, number>,
        female: Object.fromEntries(
          TEST_CATEGORIES.map((cat) => [cat, 0])
        ) as Record<string, number>,
      },
      genderCount: {
        male: Object.fromEntries(
          TEST_CATEGORIES.map((cat) => [cat, 0])
        ) as Record<string, number>,
        female: Object.fromEntries(
          TEST_CATEGORIES.map((cat) => [cat, 0])
        ) as Record<string, number>,
      },
      genderDistribution: { male: 0, female: 0 },
      levelDistribution: { excellent: 0, good: 0, pass: 0, fail: 0 },
      studentScores: [] as Array<{
        id: string;
        name: string;
        totalScore: number;
      }>,
      //各项目学生成绩数组
      categoryStudents: Object.fromEntries(
        TEST_CATEGORIES.map((cat) => [
          cat,
          [] as Array<{
            id: string;
            name: string;
            score: number;
            level: string;
            rawData?: number;
          }>,
        ])
      ) as Record<
        string,
        Array<{
          id: string;
          name: string;
          score: number;
          level: string;
          rawData?: number;
        }>
      >,
    };

    // 单次遍历处理所有数据
    studentsArray.forEach((student: any) => {
      this._processStudentOptimized(student, accumulator);
    });

    // 计算平均分和构建最终结果
    return this._buildFinalStats(accumulator, totalStudents);
  }

  /**
   * 优化的单个学生处理方法
   * @param student 学生数据
   * @param accumulator 累加器
   */
  private _processStudentOptimized(student: any, accumulator: any): void {
    // 性别分布
    const gender = student.gender === "male" ? "male" : "female";
    accumulator.genderDistribution[gender]++;

    if (!student.data) return;

    let studentTotal = 0;
    let validItems = 0;

    // 处理所有测试项目
    TEST_CATEGORIES.forEach((category) => {
      const score = student.data[category];
      if (typeof score === "number" && score > 0) {
        accumulator.scoreSum[category] += score;
        accumulator.validCount[category]++;
        accumulator.genderSum[gender][category] += score;
        accumulator.genderCount[gender][category]++;
        studentTotal += score;
        validItems++;

        // 收集各项目学生数据
        const level = this._calculateLevel(score);
        accumulator.categoryStudents[category].push({
          id: student.stu_id,
          name: student.name,
          score: score,
          level: level,
          rawData: student.sportData?.[category] || undefined,
        });
      }
    });

    // 学生总分和平均分
    if (validItems > 0) {
      student.data.total = studentTotal;
      student.data.average = studentTotal / validItems;
      student.totalScore = studentTotal;
      student.avgScore = student.data.average;

      // 评级
      const level = this._calculateLevel(student.data.average);
      accumulator.levelDistribution[level]++;
      student.level = level;

      // 记录学生成绩（用于排名）
      accumulator.studentScores.push({
        id: student.stu_id,
        name: student.name,
        totalScore: studentTotal,
      });
    } else {
      student.data.total = 0;
      student.data.average = 0;
      student.totalScore = 0;
      student.avgScore = 0;
      student.level = "fail";
      accumulator.levelDistribution.fail++;
    }
  }

  /**
   * 计算各项目前5名学生
   * @param categoryStudents 各项目学生数据
   * @returns 各项目前5名学生
   */
  private _calculateCategoryTopStudents(
    categoryStudents: Record<
      string,
      Array<{
        id: string;
        name: string;
        score: number;
        level: string;
        rawData?: number;
      }>
    >
  ): CategoryTopStudents {
    const result: CategoryTopStudents = {
      erScore: [],
      sdrScore: [],
      sarScore: [],
      sljScore: [],
      vcScore: [],
      sapScore: [],
    };

    // 为每个项目计算前5名
    TEST_CATEGORIES.forEach((category) => {
      const students = categoryStudents[category] || [];

      // 按分数降序排序，取前5名
      const topStudents = students
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((student) => ({
          id: student.id,
          name: student.name,
          score: student.score,
          level: this._mapLevelToStandard(student.level) as Level,
          rawData: student.rawData,
        }));

      result[category as keyof CategoryTopStudents] = topStudents;
    });

    return result;
  }

  /**
   * 将英文评级映射为中文评级
   * @param level 英文评级
   * @returns 中文评级
   */
  private _mapLevelToStandard(level: string): Level {
    switch (level) {
      case "excellent":
        return "优秀";
      case "good":
        return "良好";
      case "pass":
        return "及格";
      case "fail":
        return "不及格";
      default:
        return "无评级";
    }
  }

  /**
   * 快速评级计算
   * @param avgScore 平均分
   * @returns 评级
   */
  private _calculateLevel(avgScore: number): Level {
    if (avgScore >= 85) return "优秀";
    if (avgScore >= 70) return "良好";
    if (avgScore >= 60) return "及格";
    return "不及格";
  }

  /**
   * 构建最终统计结果
   * @param accumulator 累加器
   * @param totalStudents 学生总数
   * @returns 最终统计结果
   */
  private _buildFinalStats(
    accumulator: any,
    totalStudents: number
  ): GradeStats {
    // 计算平均分
    const averageScores = Object.fromEntries(
      TEST_CATEGORIES.map((cat) => [
        cat,
        accumulator.validCount[cat] > 0
          ? accumulator.scoreSum[cat] / accumulator.validCount[cat]
          : 0,
      ])
    ) as any;

    // 总体平均分
    const totalValidScores = TEST_CATEGORIES.reduce(
      (sum, cat) => sum + accumulator.scoreSum[cat],
      0
    );
    const totalValidCount = TEST_CATEGORIES.reduce(
      (sum, cat) => sum + accumulator.validCount[cat],
      0
    );
    averageScores.total = totalValidCount > 0 ? totalValidScores : 0;
    averageScores.average =
      totalValidCount > 0 ? totalValidScores / totalValidCount : 0;

    // 性别统计
    const genderStats = {
      male: this._calculateGenderStats(
        accumulator.genderSum.male,
        accumulator.genderCount.male
      ),
      female: this._calculateGenderStats(
        accumulator.genderSum.female,
        accumulator.genderCount.female
      ),
    };

    // Top学生（使用快速排序的前N项）
    const topStudents = this._getTopN(accumulator.studentScores, 5);

    // 弱项分析
    const weakestCategories = this._getWeakestCategories(averageScores);

    // 各项目前5名学生
    const categoryTopStudents = this._calculateCategoryTopStudents(
      accumulator.categoryStudents
    );

    return {
      totalStudents,
      genderDistribution: accumulator.genderDistribution,
      averageScores,
      levelDistribution: accumulator.levelDistribution,
      topStudents,
      weakestCategories,
      genderStats,
      categoryTopStudents,
    };
  }

  /**
   * 计算性别统计
   * @param sum 累计分数
   * @param count 计数
   * @returns 性别统计
   */
  private _calculateGenderStats(
    sum: Record<string, number>,
    count: Record<string, number>
  ): any {
    const averageScores = Object.fromEntries(
      TEST_CATEGORIES.map((cat) => [
        cat,
        count[cat] > 0 ? sum[cat] / count[cat] : 0,
      ])
    ) as any;

    const totalScore = TEST_CATEGORIES.reduce(
      (total, cat) => total + sum[cat],
      0
    );
    const totalCount = TEST_CATEGORIES.reduce(
      (total, cat) => total + count[cat],
      0
    );

    averageScores.total = totalScore;
    averageScores.average = totalCount > 0 ? totalScore / totalCount : 0;

    return {
      averageScores,
      weakestCategories: this._getWeakestCategories(averageScores, 2),
    };
  }

  /**
   * 高效获取前N名学生
   * @param students 学生数组
   * @param n 前N名
   * @returns 前N名学生
   */
  private _getTopN(
    students: Array<{ id: string; name: string; totalScore: number }>,
    n: number
  ): Array<{ id: string; name: string; totalScore: number }> {
    if (students.length <= n) {
      return students.sort((a, b) => b.totalScore - a.totalScore);
    }

    // 使用部分排序优化
    return students.sort((a, b) => b.totalScore - a.totalScore).slice(0, n);
  }

  /**
   * 获取弱项分析
   * @param averageScores 平均分数
   * @param count 弱项数量
   * @returns 弱项数组
   */
  private _getWeakestCategories(
    averageScores: any,
    count: number = 2
  ): Array<{ name: string; score: number }> {
    return TEST_CATEGORIES.map((cat) => ({
      name: CATEGORY_NAMES[cat],
      score: averageScores[cat] || 0,
    }))
      .sort((a, b) => a.score - b.score)
      .slice(0, count);
  }

  /**
   * 获取学生成绩数据分析
   * @returns 成绩分析结果
   */
  public async getAnalyseScoreData(): Promise<Record<string, any>> {
    if (Object.keys(this.data).length === 0) {
      await this.__getRemoteData();
    }

    const analysisResult: Record<string, any> = {};

    for (const stu_id in this.data) {
      const studentData = this.data[stu_id];
      const studentAnalysis: any = {};

      if (studentData.data) {
        // 计算各项成绩占标准分的百分比
        for (const category in studentData.data) {
          if (this.standard[category] && this.standard[category] > 0) {
            const percentage =
              (studentData.data[category] / this.standard[category]) * 100;
            studentAnalysis[category] = parseFloat(percentage.toFixed(2));
          }
        }

        // 确定强项和弱项
        const categories = Object.keys(studentAnalysis)
          .filter((key) => key !== "total" && key !== "average")
          .map((key) => ({ name: key, score: studentAnalysis[key] }))
          .sort((a, b) => b.score - a.score);

        studentAnalysis.strengths = categories.slice(0, 2).map((c) => c.name);
        studentAnalysis.weaknesses = categories.slice(-2).map((c) => c.name);

        // 与年级平均水平比较
        studentAnalysis.comparedToAverage = {};
        for (const category in studentData.data) {
          if (this.standard[category] && this.standard[category] > 0) {
            const diff = studentData.data[category] - this.standard[category];
            const percentage = (diff / this.standard[category]) * 100;
            studentAnalysis.comparedToAverage[category] = parseFloat(
              percentage.toFixed(2)
            );
          }
        }

        analysisResult[stu_id] = studentAnalysis;
      }
    }

    return analysisResult;
  }

  /**
   * 获取年级历年体测数据分析（高度优化版）
   * @returns 年级历年体测数据趋势分析
   */
  public async getGradeHistoryAnalysis(): Promise<
    GradeHistoryAnalysis | ErrorResponse
  > {
    // 检查缓存
    if (
      this._isCacheValid(this._historyCacheKey) &&
      historyDataCache.has(this._historyCacheKey)
    ) {
      return historyDataCache.get(this._historyCacheKey)!;
    }

    if (Object.keys(this.history_data).length === 0) {
      await this.__getGradeHistoryData();
    }

    // 如果还是没有历史数据，返回错误
    if (Object.keys(this.history_data).length === 0) {
      return { error: "没有可用的年级历史数据" };
    }

    const analysis = this._analyzeHistoryDataOptimized();

    // 缓存结果
    historyDataCache.set(this._historyCacheKey, analysis);
    this._setCacheTimestamp(this._historyCacheKey);

    return analysis;
  }

  /**
   * 优化的历史数据分析方法
   * @returns 分析结果
   */
  private _analyzeHistoryDataOptimized(): GradeHistoryAnalysis {
    const analysis: GradeHistoryAnalysis = {
      years: [],
      averageScores: Object.fromEntries(
        [...TEST_CATEGORIES, "average"].map((cat) => [cat, []])
      ) as any,
      levelDistribution: {},
      improvement: {},
      trends: {},
    };

    // 按年份排序处理
    const yearKeys = Object.keys(this.history_data).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    // 批量处理年份数据
    const yearDataList = yearKeys.map((year) => {
      const historyItem = this.history_data[year];
      const yearNum = parseInt(year);

      let yearData;
      if (historyItem?.stats) {
        yearData = historyItem.stats;
      } else if (historyItem?.getGradeData) {
        // 异步操作需要特殊处理
        return {
          year: yearNum,
          data: null,
          needsAsync: true,
          item: historyItem,
        };
      } else {
        console.warn(`年份${year}的数据格式不正确`);
        return { year: yearNum, data: null };
      }

      return { year: yearNum, data: yearData };
    });

    // 处理需要异步获取的数据
    const asyncProcessing = yearDataList.filter((item) => item.needsAsync);
    if (asyncProcessing.length > 0) {
      // 这里需要异步处理，但为了保持方法同步，我们跳过这些数据
      console.warn("检测到需要异步处理的历史数据，建议使用预处理的数据");
    }

    // 处理同步数据
    yearDataList
      .filter((item) => item.data && !item.needsAsync)
      .forEach(({ year, data }) => {
        analysis.years.push(year);

        // 批量收集分数数据
        [...TEST_CATEGORIES, "average"].forEach((category) => {
          const score = data.averageScores?.[category] || 0;
          (
            analysis.averageScores[
              category as keyof typeof analysis.averageScores
            ] as number[]
          ).push(score);
        });

        // 收集级别分布
        if (data.levelDistribution) {
          analysis.levelDistribution[year.toString()] = data.levelDistribution;
        }
      });

    // 批量计算趋势和改进情况
    this._calculateTrendsOptimized(analysis);

    return analysis;
  }

  /**
   * 优化的趋势计算方法
   * @param analysis 分析数据
   */
  private _calculateTrendsOptimized(analysis: GradeHistoryAnalysis): void {
    if (analysis.years.length < 2) return;

    [...TEST_CATEGORIES, "average"].forEach((category) => {
      const scores =
        analysis.averageScores[category as keyof typeof analysis.averageScores];
      if (scores.length < 2) return;

      // 计算改进情况
      const firstScore = scores[0];
      const lastScore = scores[scores.length - 1];
      const change = lastScore - firstScore;
      const changePercent = firstScore > 0 ? (change / firstScore) * 100 : 0;

      analysis.improvement[category] = {
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        improved: change > 0,
      };

      // 优化的趋势计算
      analysis.trends[category] = this._calculateTrendOptimized(scores);
    });
  }

  /**
   * 优化的单项趋势计算
   * @param scores 分数数组
   * @returns 趋势
   */
  private _calculateTrendOptimized(scores: number[]): Trend {
    if (scores.length < 2) return "稳定";

    let increasingCount = 0;
    let decreasingCount = 0;
    let stableCount = 0;
    const threshold = 0.5; // 稳定阈值

    // 单次遍历计算趋势
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
    const stabilityThreshold = 0.6;

    if (increasingCount > totalChanges * stabilityThreshold) return "上升";
    if (decreasingCount > totalChanges * stabilityThreshold) return "下降";
    if (stableCount > totalChanges * stabilityThreshold) return "稳定";
    return "波动";
  }

  /**
   * 获取年级历年体测数据
   * @private
   */
  private async __getGradeHistoryData(): Promise<void> {
    try {
      // 1. 先获取年级可用的年份数据
      const availableYears = await fetchGradeAvailableYears(this.grade_id);

      if (availableYears.length === 0) {
        console.warn(`年级${this.grade_id}没有可用的历史数据年份`);
        this.history_data = {};
        return;
      }

      console.log(`年级${this.grade_id}可用年份: ${availableYears.join(", ")}`);

      // 2. 使用优化的并发控制策略
      this.history_data = {};

      // 分批处理年份，避免过多并发请求
      const batchSize = PERFORMANCE_CONFIG.MAX_PARALLEL_REQUESTS;
      const results = new Map<string, any>();

      for (let i = 0; i < availableYears.length; i += batchSize) {
        const batch = availableYears.slice(i, i + batchSize);

        const batchPromises = batch.map(async (year) => {
          try {
            const yearNum = parseInt(year);
            console.log(`正在获取年级${this.grade_id}在${year}年的数据...`);

            // 创建该年份的 GradeData 实例，但使用缓存优化
            const gradeDataForYear = new GradeData(this.grade_id, yearNum);

            // 检查是否有缓存的数据
            const cacheKey = `grade_${this.grade_id}_${yearNum}`;
            let gradeStats;

            if (gradeDataCache.has(cacheKey) && this._isCacheValid(cacheKey)) {
              gradeStats = gradeDataCache.get(cacheKey)!;
              console.log(`使用缓存数据: 年级${this.grade_id}在${year}年`);
            } else {
              // 获取该年份的年级统计数据
              gradeStats = await gradeDataForYear.getGradeData();
            }

            if ("error" in gradeStats) {
              console.warn(
                `获取年级${this.grade_id}在${year}年的数据失败: ${gradeStats.error}`
              );
              return { year, data: null };
            }

            console.log(
              `成功获取年级${this.grade_id}在${year}年的数据，学生总数: ${gradeStats.totalStudents}`
            );

            return {
              year,
              data: {
                gradeInstance: gradeDataForYear,
                stats: gradeStats,
              },
            };
          } catch (error) {
            console.error(
              `处理年级${this.grade_id}在${year}年数据时出错:`,
              error
            );
            return { year, data: null };
          }
        });

        // 等待当前批次完成
        const batchResults = await Promise.all(batchPromises);

        // 收集结果
        batchResults.forEach(({ year, data }) => {
          if (data !== null) {
            results.set(year, data);
          }
        });

        // 短暂延迟，避免过载
        if (i + batchSize < availableYears.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // 4. 整理历史数据
      results.forEach((data, year) => {
        this.history_data[year] = data;
      });

      const successCount = results.size;
      console.log(
        `年级${this.grade_id}历史数据获取完成，成功获取${successCount}年数据`
      );

      // 内存管理：如果数据过多，清理老的缓存
      this._manageMemory();
    } catch (error) {
      console.error("年级历史数据获取失败:", error);
      this.history_data = {};
    }
  }

  /**
   * 内存管理方法
   */
  private _manageMemory(): void {
    // 如果缓存过多，清理最老的缓存
    if (gradeDataCache.size > PERFORMANCE_CONFIG.MEMORY_LIMIT) {
      const entries = Array.from(cacheTimestamps.entries());
      entries.sort((a, b) => a[1] - b[1]); // 按时间排序

      // 清理最老的20%
      const clearCount = Math.floor(entries.length * 0.2);
      for (let i = 0; i < clearCount; i++) {
        const [key] = entries[i];
        gradeDataCache.delete(key);
        historyDataCache.delete(key);
        studentDataCache.delete(key);
        cacheTimestamps.delete(key);
      }

      console.log(`清理了${clearCount}个过期缓存项`);
    }
  }

  /**
   * 获取年级可用数据年份
   * @returns 可用年份数组
   */
  public async getAvailableYears(): Promise<string[]> {
    return await fetchGradeAvailableYears(this.grade_id);
  }

  /**
   * 获取年级指定年份范围的对比分析
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @returns 年份范围对比分析
   */
  public async getYearRangeComparison(
    startYear: number,
    endYear: number
  ): Promise<
    | {
        comparison: Record<string, any>;
        summary: {
          overallTrend: Trend;
          bestYear: { year: number; avgScore: number };
          worstYear: { year: number; avgScore: number };
          improvementRate: number;
        };
      }
    | ErrorResponse
  > {
    try {
      // 确保历史数据已加载
      if (Object.keys(this.history_data).length === 0) {
        await this.__getGradeHistoryData();
      }

      const comparison: Record<string, any> = {};
      const yearlyAvgScores: { year: number; avgScore: number }[] = [];

      // 获取指定年份范围内的数据
      for (let year = startYear; year <= endYear; year++) {
        const yearStr = year.toString();
        if (this.history_data[yearStr]) {
          const historyItem = this.history_data[yearStr];
          let yearData;

          if (historyItem && historyItem.stats) {
            yearData = historyItem.stats;
          } else if (
            historyItem &&
            typeof historyItem.getGradeData === "function"
          ) {
            yearData = await historyItem.getGradeData();
          }

          if (yearData && !("error" in yearData)) {
            comparison[yearStr] = {
              totalStudents: yearData.totalStudents,
              averageScores: yearData.averageScores,
              levelDistribution: yearData.levelDistribution,
              genderDistribution: yearData.genderDistribution,
            };

            yearlyAvgScores.push({
              year,
              avgScore: yearData.averageScores.average || 0,
            });
          }
        }
      }

      if (yearlyAvgScores.length === 0) {
        return { error: `${startYear}-${endYear}年份范围内没有可用数据` };
      }

      // 计算总结信息
      const bestYear = yearlyAvgScores.reduce((prev, current) =>
        prev.avgScore > current.avgScore ? prev : current
      );
      const worstYear = yearlyAvgScores.reduce((prev, current) =>
        prev.avgScore < current.avgScore ? prev : current
      );

      // 计算总体改进率
      const firstYearScore = yearlyAvgScores[0].avgScore;
      const lastYearScore =
        yearlyAvgScores[yearlyAvgScores.length - 1].avgScore;
      const improvementRate =
        firstYearScore > 0
          ? ((lastYearScore - firstYearScore) / firstYearScore) * 100
          : 0;

      // 判断总体趋势
      let overallTrend: Trend = "稳定";
      if (improvementRate > 5) {
        overallTrend = "上升";
      } else if (improvementRate < -5) {
        overallTrend = "下降";
      } else if (Math.abs(improvementRate) > 1) {
        overallTrend = "波动";
      }

      return {
        comparison,
        summary: {
          overallTrend,
          bestYear,
          worstYear,
          improvementRate: Math.round(improvementRate * 100) / 100,
        },
      };
    } catch (error) {
      console.error("年份范围对比分析失败:", error);
      return { error: "年份范围对比分析失败" };
    }
  }

  /**
   * 获取年级历史数据的详细统计
   * @returns 详细统计信息
   */
  public async getDetailedHistoryStats(): Promise<
    | {
        totalYearsAnalyzed: number;
        dataCompleteness: Record<string, number>; // 各年份数据完整度
        categoryTrends: Record<
          string,
          {
            trend: Trend;
            volatility: number; // 波动性指标
            consistency: number; // 一致性指标
          }
        >;
        yearlyComparison: Array<{
          year: number;
          rank: number; // 该年在历史中的排名
          percentile: number; // 百分位数
        }>;
      }
    | ErrorResponse
  > {
    try {
      if (Object.keys(this.history_data).length === 0) {
        await this.__getGradeHistoryData();
      }

      const historyAnalysis = await this.getGradeHistoryAnalysis();
      if ("error" in historyAnalysis) {
        return historyAnalysis;
      }

      const totalYearsAnalyzed = historyAnalysis.years.length;
      const dataCompleteness: Record<string, number> = {};
      const categoryTrends: Record<string, any> = {};
      const yearlyComparison: Array<any> = [];

      // 计算数据完整度
      for (const year of historyAnalysis.years) {
        const yearStr = year.toString();
        const historyItem = this.history_data[yearStr];
        let completeness = 0;

        if (historyItem && historyItem.stats) {
          const stats = historyItem.stats;
          const categories = [
            "erScore",
            "sdrScore",
            "sarScore",
            "sljScore",
            "vcScore",
            "sapScore",
          ];
          const validCategories = categories.filter(
            (cat) => stats.averageScores && stats.averageScores[cat] > 0
          );
          completeness = (validCategories.length / categories.length) * 100;
        }

        dataCompleteness[yearStr] = Math.round(completeness);
      }

      // 计算各类别的详细趋势分析
      for (const category in historyAnalysis.averageScores) {
        const scores =
          historyAnalysis.averageScores[
            category as keyof typeof historyAnalysis.averageScores
          ];
        if (scores.length >= 2) {
          // 计算波动性（标准差）
          const mean =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          const variance =
            scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
            scores.length;
          const volatility = Math.sqrt(variance);

          // 计算一致性（变异系数的倒数）
          const consistency = mean > 0 ? (1 - volatility / mean) * 100 : 0;

          categoryTrends[category] = {
            trend: historyAnalysis.trends[category] || "稳定",
            volatility: Math.round(volatility * 100) / 100,
            consistency: Math.round(Math.max(0, consistency) * 100) / 100,
          };
        }
      }

      // 计算年度排名和百分位数
      const avgScores = historyAnalysis.averageScores.average;
      historyAnalysis.years.forEach((year, index) => {
        const score = avgScores[index];
        const rank =
          avgScores
            .map((s, i) => ({ score: s, year: historyAnalysis.years[i] }))
            .sort((a, b) => b.score - a.score)
            .findIndex((item) => item.year === year) + 1;

        const percentile =
          ((totalYearsAnalyzed - rank + 1) / totalYearsAnalyzed) * 100;

        yearlyComparison.push({
          year,
          rank,
          percentile: Math.round(percentile * 100) / 100,
        });
      });

      return {
        totalYearsAnalyzed,
        dataCompleteness,
        categoryTrends,
        yearlyComparison,
      };
    } catch (error) {
      console.error("详细历史统计分析失败:", error);
      return { error: "详细历史统计分析失败" };
    }
  }

  /**
   * 清理年级数据缓存
   */
  public clearCache(): void {
    this.data = {};
    this.history_data = {};
    this.standard = {};

    // 清理相关的全局缓存
    gradeDataCache.delete(this._cacheKey);
    historyDataCache.delete(this._historyCacheKey);
    cacheTimestamps.delete(this._cacheKey);
    cacheTimestamps.delete(this._historyCacheKey);
  }

  /**
   * 静态方法：清理所有缓存
   */
  public static clearAllCaches(): void {
    gradeDataCache.clear();
    historyDataCache.clear();
    studentDataCache.clear();
    cacheTimestamps.clear();
    console.log("已清理所有缓存");
  }

  /**
   * 静态方法：获取缓存统计信息
   */
  public static getCacheStats(): {
    gradeDataCacheSize: number;
    historyDataCacheSize: number;
    studentDataCacheSize: number;
    totalMemoryUsage: number;
    oldestCacheAge: number;
  } {
    const now = Date.now();
    let oldestAge = 0;

    for (const timestamp of cacheTimestamps.values()) {
      const age = now - timestamp;
      if (age > oldestAge) {
        oldestAge = age;
      }
    }

    return {
      gradeDataCacheSize: gradeDataCache.size,
      historyDataCacheSize: historyDataCache.size,
      studentDataCacheSize: studentDataCache.size,
      totalMemoryUsage:
        gradeDataCache.size + historyDataCache.size + studentDataCache.size,
      oldestCacheAge: Math.floor(oldestAge / 1000), // 转换为秒
    };
  }

  /**
   * 静态方法：预热指定年级的缓存
   * @param gradeIds 年级ID数组
   * @param years 年份数组
   */
  public static async preWarmCache(
    gradeIds: Grade[],
    years: number[]
  ): Promise<void> {
    console.log(
      `开始预热缓存: ${gradeIds.length}个年级, ${years.length}个年份`
    );

    const tasks = [];
    for (const gradeId of gradeIds) {
      for (const year of years) {
        tasks.push(async () => {
          const gradeData = new GradeData(gradeId, year);
          await gradeData.getGradeData();
        });
      }
    }

    // 分批执行预热任务
    const batchSize = PERFORMANCE_CONFIG.MAX_PARALLEL_REQUESTS;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      await Promise.all(batch.map((task) => task()));

      // 避免过载
      if (i + batchSize < tasks.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    console.log("缓存预热完成");
  }

  /**
   * 静态方法：设置性能配置
   * @param config 性能配置
   */
  public static setPerformanceConfig(
    config: Partial<typeof PERFORMANCE_CONFIG>
  ): void {
    Object.assign(PERFORMANCE_CONFIG, config);
    console.log("性能配置已更新:", PERFORMANCE_CONFIG);
  }

  /**
   * 静态方法：获取性能统计
   */
  public static getPerformanceStats(): {
    cacheHitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
  } {
    // 这里可以添加更详细的性能统计逻辑
    // 目前返回基础统计
    return {
      cacheHitRate: 0, // 需要实现缓存命中率统计
      averageResponseTime: 0, // 需要实现响应时间统计
      totalRequests: 0, // 需要实现请求总数统计
      errorRate: 0, // 需要实现错误率统计
    };
  }
}
