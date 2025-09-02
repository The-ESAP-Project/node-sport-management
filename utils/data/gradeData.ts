import {
  Grade,
  GradeStats,
  GradeHistoryAnalysis,
  ErrorResponse,
  Trend,
} from "./types";

/**
 * 年级体测数据处理类
 */
export class GradeData {
  public grade_id: Grade;
  public year: number;
  public data: Record<string, any>;
  public standard: Record<string, number>;
  public history_data: Record<string, any>;

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
  }

  private __getRemoteData(): void {
    // TODO: 实现远程数据获取逻辑
  }

  /**
   * 获取年级指定年份的体测数据和成绩
   * @returns 年级体测成绩数据
   */
  public getGradeData(): GradeStats | ErrorResponse {
    if (Object.keys(this.data).length === 0) {
      this.__getRemoteData();
    }

    const scoreSum = {
      erScore: 0,
      sdrScore: 0,
      sarScore: 0,
      sljScore: 0,
      vcScore: 0,
      sapScore: 0,
      total: 0,
    };
    const validCount = {
      erScore: 0,
      sdrScore: 0,
      sarScore: 0,
      sljScore: 0,
      vcScore: 0,
      sapScore: 0,
      total: 0,
    };

    const stats: GradeStats = {
      totalStudents: Object.keys(this.data).length,
      genderDistribution: { male: 0, female: 0 },
      averageScores: {
        erScore: 0,
        sdrScore: 0,
        sarScore: 0,
        sljScore: 0,
        vcScore: 0,
        sapScore: 0,
        total: 0,
        average: 0,
      },
      levelDistribution: { excellent: 0, good: 0, pass: 0, fail: 0 },
      topStudents: [],
      weakestCategories: [],
      genderStats: {
        male: { averageScores: {} as any, weakestCategories: [] },
        female: { averageScores: {} as any, weakestCategories: [] },
      },
    };

    if (stats.totalStudents === 0) return { error: "没有可用的年级数据" };

    // 初始化性别分项统计
    const genderSum = {
      male: {
        erScore: 0,
        sdrScore: 0,
        sarScore: 0,
        sljScore: 0,
        vcScore: 0,
        sapScore: 0,
        total: 0,
      },
      female: {
        erScore: 0,
        sdrScore: 0,
        sarScore: 0,
        sljScore: 0,
        vcScore: 0,
        sapScore: 0,
        total: 0,
      },
    };
    const genderCount = {
      male: {
        erScore: 0,
        sdrScore: 0,
        sarScore: 0,
        sljScore: 0,
        vcScore: 0,
        sapScore: 0,
        total: 0,
      },
      female: {
        erScore: 0,
        sdrScore: 0,
        sarScore: 0,
        sljScore: 0,
        vcScore: 0,
        sapScore: 0,
        total: 0,
      },
    };

    const studentsArr = Object.values(this.data);

    studentsArr.forEach((student: any) => {
      // 先计算学生成绩
      if (typeof student.getFullData === "function") {
        // 如果 student 是 StudentData 实例
        student.data = student.getFullData();
      }

      // 性别分布
      if (student.gender === "male") stats.genderDistribution.male++;
      else if (student.gender === "female") stats.genderDistribution.female++;

      // 累加分数和有效人数
      if (student.data) {
        let studentTotal = 0;
        let validItems = 0;
        [
          "erScore",
          "sdrScore",
          "sarScore",
          "sljScore",
          "vcScore",
          "sapScore",
        ].forEach((cat) => {
          if (typeof student.data[cat] === "number" && student.data[cat] > 0) {
            scoreSum[cat as keyof typeof scoreSum] += student.data[cat];
            validCount[cat as keyof typeof validCount]++;
            studentTotal += student.data[cat];
            validItems++;
            // 性别分项
            if (student.gender === "male") {
              genderSum.male[cat as keyof typeof genderSum.male] +=
                student.data[cat];
              genderCount.male[cat as keyof typeof genderCount.male]++;
            } else if (student.gender === "female") {
              genderSum.female[cat as keyof typeof genderSum.female] +=
                student.data[cat];
              genderCount.female[cat as keyof typeof genderCount.female]++;
            }
          }
        });

        if (validItems > 0) {
          scoreSum.total += studentTotal;
          validCount.total++;
          student.data.total = studentTotal;
          student.data.average = studentTotal / validItems;
          // 性别分项
          if (student.gender === "male") {
            genderSum.male.total += studentTotal;
            genderCount.male.total++;
          } else if (student.gender === "female") {
            genderSum.female.total += studentTotal;
            genderCount.female.total++;
          }
        } else {
          student.data.total = 0;
          student.data.average = 0;
        }

        // 级别
        let level: keyof typeof stats.levelDistribution = "fail";
        if (student.data.average >= 85) level = "excellent";
        else if (student.data.average >= 70) level = "good";
        else if (student.data.average >= 60) level = "pass";
        stats.levelDistribution[level]++;
        student.totalScore = student.data.total;
        student.avgScore = student.data.average;
        student.level = level;
      }
    });

    // 平均分（按有效人数计算）
    [
      "erScore",
      "sdrScore",
      "sarScore",
      "sljScore",
      "vcScore",
      "sapScore",
      "total",
    ].forEach((cat) => {
      const key = cat as keyof typeof scoreSum;
      stats.averageScores[key] =
        validCount[key] > 0 ? scoreSum[key] / validCount[key] : 0;
      // 性别分项
      stats.genderStats.male.averageScores[key] =
        genderCount.male[key] > 0
          ? genderSum.male[key] / genderCount.male[key]
          : 0;
      stats.genderStats.female.averageScores[key] =
        genderCount.female[key] > 0
          ? genderSum.female[key] / genderCount.female[key]
          : 0;
    });

    stats.averageScores.average =
      validCount.total > 0 ? scoreSum.total / (validCount.total * 6) : 0;
    stats.genderStats.male.averageScores.average =
      genderCount.male.total > 0
        ? genderSum.male.total / (genderCount.male.total * 6)
        : 0;
    stats.genderStats.female.averageScores.average =
      genderCount.female.total > 0
        ? genderSum.female.total / (genderCount.female.total * 6)
        : 0;

    // 性别分项弱项
    stats.genderStats.male.weakestCategories = [
      { name: "耐力跑", score: stats.genderStats.male.averageScores.erScore },
      { name: "50米跑", score: stats.genderStats.male.averageScores.sdrScore },
      {
        name: "坐位体前屈",
        score: stats.genderStats.male.averageScores.sarScore,
      },
      {
        name: "立定跳远",
        score: stats.genderStats.male.averageScores.sljScore,
      },
      { name: "肺活量", score: stats.genderStats.male.averageScores.vcScore },
      {
        name: "仰卧起坐/引体向上",
        score: stats.genderStats.male.averageScores.sapScore,
      },
    ]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    stats.genderStats.female.weakestCategories = [
      { name: "耐力跑", score: stats.genderStats.female.averageScores.erScore },
      {
        name: "50米跑",
        score: stats.genderStats.female.averageScores.sdrScore,
      },
      {
        name: "坐位体前屈",
        score: stats.genderStats.female.averageScores.sarScore,
      },
      {
        name: "立定跳远",
        score: stats.genderStats.female.averageScores.sljScore,
      },
      { name: "肺活量", score: stats.genderStats.female.averageScores.vcScore },
      {
        name: "仰卧起坐/引体向上",
        score: stats.genderStats.female.averageScores.sapScore,
      },
    ]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    // 排名
    stats.topStudents = studentsArr
      .map((s: any) => ({
        id: s.stu_id,
        name: s.name,
        totalScore: s.totalScore || 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    // 弱项
    stats.weakestCategories = [
      { name: "耐力跑", score: stats.averageScores.erScore },
      { name: "50米跑", score: stats.averageScores.sdrScore },
      { name: "坐位体前屈", score: stats.averageScores.sarScore },
      { name: "立定跳远", score: stats.averageScores.sljScore },
      { name: "肺活量", score: stats.averageScores.vcScore },
      { name: "仰卧起坐/引体向上", score: stats.averageScores.sapScore },
    ]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    return stats;
  }

  /**
   * 获取学生成绩数据分析
   * @returns 成绩分析结果
   */
  public getAnalyseScoreData(): Record<string, any> {
    if (Object.keys(this.data).length === 0) {
      this.__getRemoteData();
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
   * 获取年级历年体测数据分析
   * @returns 年级历年体测数据趋势分析
   */
  public getGradeHistoryAnalysis(): GradeHistoryAnalysis | ErrorResponse {
    if (Object.keys(this.history_data).length === 0) {
      this.__getGradeHistoryData();
    }

    // 如果还是没有历史数据，返回空对象
    if (Object.keys(this.history_data).length === 0) {
      return { error: "没有可用的年级历史数据" };
    }

    // 对历史数据进行分析
    const analysis: GradeHistoryAnalysis = {
      years: [],
      averageScores: {
        erScore: [],
        sdrScore: [],
        sarScore: [],
        sljScore: [],
        vcScore: [],
        sapScore: [],
        average: [],
      },
      levelDistribution: {}, // 按年份存储各级别的分布
      improvement: {},
      trends: {},
    };

    // 填充年份和各项成绩数据
    for (const year in this.history_data) {
      const gradeData = this.history_data[year];
      const yearData =
        typeof gradeData.getGradeData === "function"
          ? gradeData.getGradeData()
          : gradeData;
      analysis.years.push(parseInt(year));

      // 记录当年的平均分
      for (const category in analysis.averageScores) {
        if (
          yearData.averageScores &&
          yearData.averageScores[category] !== undefined
        ) {
          (
            analysis.averageScores[
              category as keyof typeof analysis.averageScores
            ] as number[]
          ).push(yearData.averageScores[category]);
        }
      }

      // 记录当年的级别分布
      if (yearData.levelDistribution) {
        analysis.levelDistribution[year] = yearData.levelDistribution;
      }
    }

    // 计算各项目的进步趋势
    if (analysis.years.length >= 2) {
      // 排序年份以确保从旧到新
      analysis.years.sort((a, b) => a - b);

      for (const category in analysis.averageScores) {
        const scores =
          analysis.averageScores[
            category as keyof typeof analysis.averageScores
          ];
        if (scores.length >= 2) {
          // 计算起始年份与最新年份的差异
          const firstYear = scores[0];
          const lastYear = scores[scores.length - 1];
          const change = lastYear - firstYear;
          const changePercent = ((change / firstYear) * 100).toFixed(2);

          analysis.improvement[category] = {
            change,
            changePercent: parseFloat(changePercent),
            improved: change > 0,
          };

          // 判断趋势：上升、下降、波动、稳定
          let increasingCount = 0;
          let decreasingCount = 0;

          for (let i = 1; i < scores.length; i++) {
            if (scores[i] > scores[i - 1]) {
              increasingCount++;
            } else if (scores[i] < scores[i - 1]) {
              decreasingCount++;
            }
          }

          let trend: Trend = "稳定";
          if (
            increasingCount > decreasingCount &&
            increasingCount > scores.length / 3
          ) {
            trend = "上升";
          } else if (
            decreasingCount > increasingCount &&
            decreasingCount > scores.length / 3
          ) {
            trend = "下降";
          } else if (increasingCount > 0 || decreasingCount > 0) {
            trend = "波动";
          }

          analysis.trends[category] = trend;
        }
      }
    }

    return analysis;
  }

  /**
   * 获取年级历年体测数据
   * @private
   */
  private __getGradeHistoryData(): void {
    // TODO: 实现从服务器获取历史数据的逻辑
    // this.history_data = {...从服务器获取的历史数据};
  }
}
