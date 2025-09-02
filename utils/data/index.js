const fs = require("fs");
const path = require("path");
const calculateSitAndReachScore = require("./sitAndReach");
const calculateEnduranceRunScore = require("./enduranceRun");
const calculateRunning50mScore = require("./shortDistanceRunning");
const calculateSitUpAndPullUpScore = require("./sitUpAndPullUp");
const calculateStandingLongJumpScore = require("./standingLongJump");
const calculateVitalCapacityScore = require("./vitalCapacity");

class StudentData {
  /**
   *
   * @param {string} 学生姓名
   * @param {string} 学生学号
   * @param {string} 学生性别
   * @param {number} 查询指定年份数据
   */
  constructor(name, stu_id, gender, year, grade) {
    this.name = name;
    this.stu_id = stu_id;
    this.gender = gender;
    this.year = year;
    this.grade_id = grade || 1;
    this.cache_origin_data = {};
    this.cache_data = {};
    this.history_data = [];
  }

  __getRemoteData() {
    //...todo
  }

  /**
   * 获取指定年份的学生体测数据和成绩
   * @returns {Object} 学生体测成绩数据
   */
  getFullData() {
    if (Object.keys(this.cache_origin_data).length === 0) {
      this.__getRemoteData(); // 获取远程数据
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
            return { key: item.key, score: 0, level: "无数据" };
          }
          const result = item.calculate(data, this.gender, this.grade_id);
          return {
            key: item.key,
            score: result?.score || 0,
            level: result?.level || "无评级",
          };
        } catch (error) {
          console.error(`计算${item.name}成绩时出错:`, error);
          return { key: item.key, score: 0, level: "计算错误" };
        }
      });

      // 构建成绩对象
      const scores = {};
      const levels = {};
      let totalScore = 0;

      results.forEach((result) => {
        scores[result.key] = result.score;
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
      };
    }

    return this.cache_data;
  }

  /**
   * 计算总体评级
   * @param {number} avgScore 平均分
   * @returns {string} 评级
   * @private
   */
  _calculateOverallLevel(avgScore) {
    // 评级标准配置
    const levelStandards = [
      { threshold: 85, level: "优秀" },
      { threshold: 70, level: "良好" },
      { threshold: 60, level: "及格" },
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
   * @returns {Array} 体测项目配置数组
   * @private
   */
  _getTestItemsConfig() {
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
   * @param {string} itemKey 项目键名
   * @returns {Object|null} 单项成绩详情
   */
  getItemScore(itemKey) {
    const fullData = this.getFullData();
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
      level: fullData[item.key.replace("Score", "Level")] || "无评级",
      rawData: this.cache_origin_data[item.dataKey],
    };
  }

  /**
   * 获取学生历年体测数据分析
   * @returns {Object} 学生历年体测数据趋势分析
   */
  getHistoryAnalysis() {
    if (this.history_data.length === 0) {
      this.__getHistoryData();
    }

    if (this.history_data.length === 0) {
      return { error: "没有可用的历史数据" };
    }

    const analysis = {
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
      bestPerformance: { year: null, score: 0 },
      worstPerformance: { year: null, score: 100 },
      trend: "稳定",
      trajectory: [], // 新增
    };

    this.history_data.forEach((data) => {
      analysis.years.push(data.year);
      for (const category in analysis.categories) {
        if (data[category] !== undefined) {
          analysis.categories[category].push(data[category]);
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
        if (
          firstYear[category] !== undefined &&
          lastYear[category] !== undefined
        ) {
          const change = lastYear[category] - firstYear[category];
          const changePercent = ((change / firstYear[category]) * 100).toFixed(
            2
          );

          analysis.improvement[category] = {
            change,
            changePercent: parseFloat(changePercent),
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
  __getHistoryData() {
    // this.history_data = [...从服务器获取的历史数据];
  }
}

class GradeData {
  /**
   * @param {string} 年级
   * @param {number} 查询年份
   */
  constructor(grade_id, year) {
    this.grade_id = grade_id;
    this.year = year || new Date().getFullYear();
    this.data = {};
    this.standard = {};
    this.history_data = {};
  }

  __getRemoteData() {
    //...todo
  }

  /**
   * 获取年级指定年份的体测数据和成绩
   * @returns {Object} 年级体测成绩数据
   */
  getGradeData() {
    if (Object.keys(this.data).length === 0) {
      this.__getRemoteData();
    }

    const stats = {
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
        // 新增
        male: { averageScores: {}, weakestCategories: [] },
        female: { averageScores: {}, weakestCategories: [] },
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

    studentsArr.forEach((student) => {
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
            scoreSum[cat] += student.data[cat];
            validCount[cat]++;
            studentTotal += student.data[cat];
            validItems++;
            // 性别分项
            if (student.gender === "male") {
              genderSum.male[cat] += student.data[cat];
              genderCount.male[cat]++;
            } else if (student.gender === "female") {
              genderSum.female[cat] += student.data[cat];
              genderCount.female[cat]++;
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
        let level = "fail";
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
      stats.averageScores[cat] =
        validCount[cat] > 0 ? scoreSum[cat] / validCount[cat] : 0;
      // 性别分项
      stats.genderStats.male.averageScores[cat] =
        genderCount.male[cat] > 0
          ? genderSum.male[cat] / genderCount.male[cat]
          : 0;
      stats.genderStats.female.averageScores[cat] =
        genderCount.female[cat] > 0
          ? genderSum.female[cat] / genderCount.female[cat]
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
      .map((s) => ({
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
   * @returns {Object} 成绩分析结果
   */
  getAnalyseScoreData() {
    if (Object.keys(this.data).length === 0) {
      this.__getRemoteData();
    }

    const analysisResult = {};

    for (let stu_id in this.data) {
      const studentData = this.data[stu_id];
      const studentAnalysis = {};

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
   * @returns {Object} 年级历年体测数据趋势分析
   */
  getGradeHistoryAnalysis() {
    if (Object.keys(this.history_data).length === 0) {
      this.__getGradeHistoryData();
    }

    // 如果还是没有历史数据，返回空对象
    if (Object.keys(this.history_data).length === 0) {
      return { error: "没有可用的年级历史数据" };
    }

    // 对历史数据进行分析
    const analysis = {
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
        typeof gradeData === "function" ? gradeData() : gradeData;
      analysis.years.push(parseInt(year));

      // 记录当年的平均分
      for (const category in analysis.averageScores) {
        if (
          yearData.averageScores &&
          yearData.averageScores[category] !== undefined
        ) {
          analysis.averageScores[category].push(
            yearData.averageScores[category]
          );
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
        const scores = analysis.averageScores[category];
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

          let trend = "稳定";
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
  __getGradeHistoryData() {
    // this.history_data = {...从服务器获取的历史数据};
  }
}

module.exports = { StudentData, GradeData };
