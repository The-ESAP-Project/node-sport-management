import { calculateSitAndReachScore } from "./sitAndReach";
import { calculateEnduranceRunScore } from "./enduranceRun";
import { calculateRunning50mScore } from "./shortDistanceRunning";
import { calculateSitUpAndPullUpScore } from "./sitUpAndPullUp";
import { calculateStandingLongJumpScore } from "./standingLongJump";
import { calculateVitalCapacityScore } from "./vitalCapacity";
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
  }

  private async __getRemoteData(): Promise<void> {
    // TODO: 实现远程数据获取逻辑
    try {
      // 示例：从API获取学生原始数据
      const response = await fetch(
        `/api/student/${this.stu_id}/data?year=${this.year}`
      );
      if (response.ok) {
        this.cache_origin_data = await response.json();
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
    if (Object.keys(this.cache_origin_data).length === 0) {
      await this.__getRemoteData(); // 获取远程数据
    }

    if (Object.keys(this.cache_origin_data).length > 0) {
      // 获取体测项目配置
      const testItems = this._getTestItemsConfig();

      // 批量计算各项成绩
      const results = testItems.map((item) => {
        try {
          const data = this.cache_origin_data[item.dataKey];
          if (data === undefined || data === null) {
            console.warn(`${item.name}数据缺失`);
            return { key: item.key, score: 0, level: "无数据" as Level };
          }
          const result = item.calculate(data, this.gender, this.grade_id);
          return {
            key: item.key,
            score: result?.score || 0,
            level: result?.level || ("无评级" as Level),
          };
        } catch (error) {
          console.error(`计算${item.name}成绩时出错:`, error);
          return { key: item.key, score: 0, level: "计算错误" as Level };
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
      const avgScore = totalScore / testItems.length;
      const overallLevel = this._calculateOverallLevel(avgScore);

      this.cache_data = {
        ...scores,
        ...levels,
        totalScore,
        avgScore: Math.round(avgScore * 100) / 100, // 保留两位小数
        overallLevel,
        year: this.year,
        testItemsCount: testItems.length, // 记录测试项目数量
      } as ScoreData;
    }

    return this.cache_data;
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
    if (this.history_data.length === 0) {
      await this.__getHistoryData();
    }

    if (this.history_data.length === 0) {
      return { error: "没有可用的历史数据" };
    }

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

    this.history_data.forEach((data) => {
      analysis.years.push(data.year);
      for (const category in analysis.categories) {
        if (data[category as keyof StudentHistoryData] !== undefined) {
          (
            analysis.categories[
              category as keyof typeof analysis.categories
            ] as number[]
          ).push(data[category as keyof StudentHistoryData] as number);
        }
      }
      // 记录最好和最差成绩
      if (data.avgScore > analysis.bestPerformance.score) {
        analysis.bestPerformance = { year: data.year, score: data.avgScore };
      }
      if (data.avgScore < analysis.worstPerformance.score) {
        analysis.worstPerformance = { year: data.year, score: data.avgScore };
      }
      // 轨迹
      analysis.trajectory.push({ year: data.year, avgScore: data.avgScore });
    });

    // 计算各项目进步情况
    if (this.history_data.length >= 2) {
      const firstYear = this.history_data[0];
      const lastYear = this.history_data[this.history_data.length - 1];

      for (const category in analysis.categories) {
        const key = category as keyof StudentHistoryData;
        if (firstYear[key] !== undefined && lastYear[key] !== undefined) {
          const change = (lastYear[key] as number) - (firstYear[key] as number);
          const changePercent = (change / (firstYear[key] as number)) * 100;

          analysis.improvement[category] = {
            change,
            changePercent: parseFloat(changePercent.toFixed(2)),
            improved: change > 0,
          };
        }
      }

      // 判断整体趋势
      const scores = analysis.categories.avgScore;
      let increasingCount = 0;
      let decreasingCount = 0;

      for (let i = 1; i < scores.length; i++) {
        if (scores[i] > scores[i - 1]) {
          increasingCount++;
        } else if (scores[i] < scores[i - 1]) {
          decreasingCount++;
        }
      }

      if (
        increasingCount > decreasingCount &&
        increasingCount > scores.length / 3
      ) {
        analysis.trend = "上升";
      } else if (
        decreasingCount > increasingCount &&
        decreasingCount > scores.length / 3
      ) {
        analysis.trend = "下降";
      } else if (increasingCount === 0 && decreasingCount === 0) {
        analysis.trend = "稳定";
      } else {
        analysis.trend = "波动";
      }
    }

    return analysis;
  }

  /**
   * 获取学生历年体测数据
   * @private
   */
  private async __getHistoryData(): Promise<void> {
    // TODO: 实现从服务器获取历史数据的逻辑
    try {
      const response = await fetch(`/api/student/${this.stu_id}/history`);
      if (response.ok) {
        this.history_data = await response.json();
      } else {
        console.warn(`获取学生${this.stu_id}的历史数据失败`);
        this.history_data = [];
      }
    } catch (error) {
      console.error("历史数据获取失败:", error);
      this.history_data = [];
    }
  }
}
