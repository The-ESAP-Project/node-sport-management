const fs = require('fs');
const path = require('path');
const calculateSitAndReachScore = require('./sitAndReach');
const calculateEnduranceRunScore = require('./enduranceRun');
const calculateRunning50mScore = require('./shortDistanceRunning');
const calculateSitUpAndPullUpScore = require('./sitUpAndPullUp');
const calculateStandingLongJumpScore = require('./standingLongJump');
const calculateVitalCapacityScore = require('./vitalCapacity');

class StudentData{
    /**
     * 
     * @param {string} 学生姓名
     * @param {string} 学生学号
     * @param {string} 学生性别
     * @param {number} 查询指定年份数据
     */
    constructor(name,stu_id,gender,year,grade){
        this.name = name;
        this.stu_id = stu_id;
        this.gender = gender;
        this.year = year;
        this.grade_id = grade || 1;
        this.cache_origin_data = {};
        this.cache_data = {};
        this.history_data = [];
    }
    
    __getRemoteData(){
        //...todo
    }

    /**
     * 获取指定年份的学生体测数据和成绩
     * @returns {Object} 学生体测成绩数据
     */
    getFullData(){
        if (Object.keys(this.cache_origin_data).length === 0){
            this.__getRemoteData(); // 获取远程数据
        }
        
        if (Object.keys(this.cache_origin_data).length > 0) {
            // 获得耐力跑分数
            const erScore = calculateEnduranceRunScore(this.cache_origin_data.longRun, this.gender, this.grade_id);
            // 获得50米跑分数
            const sdrScore = calculateRunning50mScore(this.cache_origin_data.shortRun, this.gender, this.grade_id);
            // 获得坐位体前屈分数
            const sarScore = calculateSitAndReachScore(this.cache_origin_data.sitAndReach, this.gender, this.grade_id);
            // 获得立定跳远分数
            const sljScore = calculateStandingLongJumpScore(this.cache_origin_data.longJump, this.gender, this.grade_id);
            // 获得肺活量分数
            const vcScore = calculateVitalCapacityScore(this.cache_origin_data.vitalCapacity, this.gender, this.grade_id);
            // 获得仰卧起坐/引体向上分数
            const sapScore = calculateSitUpAndPullUpScore(this.cache_origin_data.sitUpAndPullUp, this.gender, this.grade_id);
            
            // 计算总分和评级
            const totalScore = erScore.score + sdrScore.score + sarScore.score + 
                              sljScore.score + vcScore.score + sapScore.score;
            const avgScore = totalScore / 6;
            let overallLevel = "不及格";
            
            if (avgScore >= 85) {
                overallLevel = "优秀";
            } else if (avgScore >= 70) {
                overallLevel = "良好";
            } else if (avgScore >= 60) {
                overallLevel = "及格";
            }
            
            this.cache_data = {
                erScore: erScore.score,
                sdrScore: sdrScore.score,
                sarScore: sarScore.score,
                sljScore: sljScore.score,
                vcScore: vcScore.score,
                sapScore: sapScore.score,
                erLevel: erScore.level,
                sdrLevel: sdrScore.level,
                sarLevel: sarScore.level,
                sljLevel: sljScore.level,
                vcLevel: vcScore.level,
                sapLevel: sapScore.level,
                totalScore,
                avgScore,
                overallLevel,
                year: this.year
            };
        }
        
        return this.cache_data;
    }
    
    /**
     * 获取学生历年体测数据分析
     * @returns {Object} 学生历年体测数据趋势分析
     */
    getHistoryAnalysis() {
        if (this.history_data.length === 0) {
            // 假设这里调用某个方法获取历史数据
            this.__getHistoryData();
        }
        
        // 如果还是没有历史数据，返回空对象
        if (this.history_data.length === 0) {
            return { error: "没有可用的历史数据" };
        }
        
        // 对历史数据进行分析
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
                avgScore: []
            },
            improvement: {},
            bestPerformance: {
                year: null,
                score: 0
            },
            worstPerformance: {
                year: null,
                score: 100
            },
            trend: "稳定" // 稳定、上升、下降、波动
        };
        
        // 填充年份和各项成绩数据
        this.history_data.forEach(data => {
            analysis.years.push(data.year);
            
            for (const category in analysis.categories) {
                if (data[category] !== undefined) {
                    analysis.categories[category].push(data[category]);
                }
            }
            
            // 记录最好和最差成绩
            if (data.avgScore > analysis.bestPerformance.score) {
                analysis.bestPerformance = {
                    year: data.year,
                    score: data.avgScore
                };
            }
            
            if (data.avgScore < analysis.worstPerformance.score) {
                analysis.worstPerformance = {
                    year: data.year,
                    score: data.avgScore
                };
            }
        });
        
        // 计算各项目进步情况
        if (this.history_data.length >= 2) {
            const firstYear = this.history_data[0];
            const lastYear = this.history_data[this.history_data.length - 1];
            
            for (const category in analysis.categories) {
                if (firstYear[category] !== undefined && lastYear[category] !== undefined) {
                    const change = lastYear[category] - firstYear[category];
                    const changePercent = (change / firstYear[category] * 100).toFixed(2);
                    
                    analysis.improvement[category] = {
                        change,
                        changePercent: parseFloat(changePercent),
                        improved: change > 0
                    };
                }
            }
            
            // 判断整体趋势
            const scores = analysis.categories.avgScore;
            let increasingCount = 0;
            let decreasingCount = 0;
            
            for (let i = 1; i < scores.length; i++) {
                if (scores[i] > scores[i-1]) {
                    increasingCount++;
                } else if (scores[i] < scores[i-1]) {
                    decreasingCount++;
                }
            }
            
            if (increasingCount > decreasingCount && increasingCount > scores.length / 3) {
                analysis.trend = "上升";
            } else if (decreasingCount > increasingCount && decreasingCount > scores.length / 3) {
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

class GradeData{
    /**
     * @param {string} 年级
     * @param {number} 查询年份
     */
    constructor(grade_id, year){
        this.grade_id = grade_id;
        this.year = year || new Date().getFullYear();
        this.data = {};
        this.standard = {};
        this.history_data = {};
    }

    __getRemoteData(){
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
                average: 0
            },
            levelDistribution: {
                excellent: 0,
                good: 0,
                pass: 0,
                fail: 0
            },
            topStudents: [],
            weakestCategories: []
        };
        
        if (Object.keys(this.data).length === 0) {
            return { error: "没有可用的年级数据" };
        }
        
        // 计算各项统计数据
        const scoreSum = {
            erScore: 0,
            sdrScore: 0,
            sarScore: 0,
            sljScore: 0,
            vcScore: 0,
            sapScore: 0,
            total: 0
        };
        
        // 计算各项平均分
        for (const studentId in this.data) {
            const student = this.data[studentId];
            
            // 性别分布
            if (student.gender === 'male') {
                stats.genderDistribution.male++;
            } else if (student.gender === 'female') {
                stats.genderDistribution.female++;
            }
            
            // 累加各项成绩
            if (student.data) {
                for (const category in scoreSum) {
                    if (student.data[category] !== undefined) {
                        scoreSum[category] += student.data[category];
                    }
                }
                
                // 计算学生总分
                const studentTotal = student.data.erScore + student.data.sdrScore + 
                                    student.data.sarScore + student.data.sljScore + 
                                    student.data.vcScore + student.data.sapScore;
                student.data.total = studentTotal;
                student.data.average = studentTotal / 6;
                
                // 计算学生级别
                let level = "fail";
                if (student.data.average >= 85) {
                    level = "excellent";
                } else if (student.data.average >= 70) {
                    level = "good";
                } else if (student.data.average >= 60) {
                    level = "pass";
                }
                
                // 更新级别分布
                stats.levelDistribution[level]++;
                
                // 记录学生的总分用于排名
                this.data[studentId].totalScore = studentTotal;
                this.data[studentId].avgScore = student.data.average;
                this.data[studentId].level = level;
            }
        }
        
        // 计算全年级平均分
        const totalStudents = stats.totalStudents > 0 ? stats.totalStudents : 1;
        for (const category in scoreSum) {
            stats.averageScores[category] = scoreSum[category] / totalStudents;
        }
        stats.averageScores.average = scoreSum.total / (totalStudents * 6);
        
        // 找出表现最好的学生（前5名）
        const students = Object.entries(this.data)
            .map(([id, student]) => ({ id, name: student.name, totalScore: student.totalScore || 0 }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5);
        
        stats.topStudents = students;
        
        // 找出年级最弱项（平均分最低的项目）
        const categoryScores = [
            { name: '耐力跑', score: stats.averageScores.erScore },
            { name: '50米跑', score: stats.averageScores.sdrScore },
            { name: '坐位体前屈', score: stats.averageScores.sarScore },
            { name: '立定跳远', score: stats.averageScores.sljScore },
            { name: '肺活量', score: stats.averageScores.vcScore },
            { name: '仰卧起坐/引体向上', score: stats.averageScores.sapScore }
        ].sort((a, b) => a.score - b.score);
        
        stats.weakestCategories = categoryScores.slice(0, 2); // 最弱的两项
        
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
                        const percentage = (studentData.data[category] / this.standard[category]) * 100;
                        studentAnalysis[category] = parseFloat(percentage.toFixed(2));
                    }
                }
                
                // 确定强项和弱项
                const categories = Object.keys(studentAnalysis)
                    .filter(key => key !== 'total' && key !== 'average')
                    .map(key => ({ name: key, score: studentAnalysis[key] }))
                    .sort((a, b) => b.score - a.score);
                
                studentAnalysis.strengths = categories.slice(0, 2).map(c => c.name);
                studentAnalysis.weaknesses = categories.slice(-2).map(c => c.name);
                
                // 与年级平均水平比较
                studentAnalysis.comparedToAverage = {};
                for (const category in studentData.data) {
                    if (this.standard[category] && this.standard[category] > 0) {
                        const diff = studentData.data[category] - this.standard[category];
                        const percentage = (diff / this.standard[category]) * 100;
                        studentAnalysis.comparedToAverage[category] = parseFloat(percentage.toFixed(2));
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
                average: []
            },
            levelDistribution: {}, // 按年份存储各级别的分布
            improvement: {},
            trends: {}
        };
        
        // 填充年份和各项成绩数据
        for (const year in this.history_data) {
            const yearData = this.history_data[year];
            analysis.years.push(parseInt(year));
            
            // 记录当年的平均分
            for (const category in analysis.averageScores) {
                if (yearData.averageScores && yearData.averageScores[category] !== undefined) {
                    analysis.averageScores[category].push(yearData.averageScores[category]);
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
                    const changePercent = (change / firstYear * 100).toFixed(2);
                    
                    analysis.improvement[category] = {
                        change,
                        changePercent: parseFloat(changePercent),
                        improved: change > 0
                    };
                    
                    // 判断趋势：上升、下降、波动、稳定
                    let increasingCount = 0;
                    let decreasingCount = 0;
                    
                    for (let i = 1; i < scores.length; i++) {
                        if (scores[i] > scores[i-1]) {
                            increasingCount++;
                        } else if (scores[i] < scores[i-1]) {
                            decreasingCount++;
                        }
                    }
                    
                    let trend = "稳定";
                    if (increasingCount > decreasingCount && increasingCount > scores.length / 3) {
                        trend = "上升";
                    } else if (decreasingCount > increasingCount && decreasingCount > scores.length / 3) {
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

module.exports = {StudentData, GradeData};
