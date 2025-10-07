import { Op, fn, col, literal } from 'sequelize';
import Student from '../models/Student';
import SportData from '../models/SportData';
import ClassInfo from '../models/ClassInfo';
import EvaluationStandard from '../models/EvaluationStandard';
import EvaluationStandardService from './evaluationStandardService';
import logger from '../utils/logger';

export interface ClassStatistics {
  classID: number;
  className: string;
  grade: number;
  totalStudents: number;
  submittedData: number;
  submissionRate: number;
  averageScore: number;
  excellentCount: number;
  goodCount: number;
  passCount: number;
  failCount: number;
  averageHeight: number;
  averageWeight: number;
  averageBMI: number;
  averageVitalCapacity: number;
}

export interface GradeStatistics {
  grade: number;
  totalClasses: number;
  totalStudents: number;
  submittedData: number;
  submissionRate: number;
  averageScore: number;
  excellentRate: number;
  goodRate: number;
  passRate: number;
  failRate: number;
  sportItemStats: SportItemStatistics[];
}

export interface SportItemStatistics {
  sportItem: string;
  unit: string;
  average: number;
  max: number;
  min: number;
  excellentCount: number;
  goodCount: number;
  passCount: number;
  failCount: number;
}

export interface TrendData {
  year: number;
  averageScore: number;
  excellentRate: number;
  passRate: number;
  totalStudents: number;
}

export interface OverallStatistics {
  totalStudents: number;
  totalClasses: number;
  totalGrades: number;
  submissionRate: number;
  averageScore: number;
  excellentRate: number;
  passRate: number;
  recentTrends: TrendData[];
}

class AnalyticsService {
  /**
   * 获取班级统计信息
   */
  static async getClassStatistics(classID: number, year: number): Promise<ClassStatistics | null> {
    try {
      // 获取班级信息
      const classInfo = await ClassInfo.findByPk(classID);
      if (!classInfo) {
        throw new Error('班级不存在');
      }

      // 获取班级学生总数
      const totalStudents = await Student.count({
        where: { classID: classID }
      });

      // 获取已提交体测数据的学生数
      const submittedData = await SportData.count({
        where: { 
          year: year,
          classID: classID,
          totalScore: { [Op.ne]: null } as any
        }
      }) as number;

      // 获取体测数据进行统计
      const sportDataList = await SportData.findAll({
        where: { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        },
        include: [{
          model: Student,
          where: { classID: classID },
          attributes: ['id']
        }],
        attributes: ['totalScore', 'height', 'weight', 'vitalCapacity']
      });

      let averageScore = 0;
      let excellentCount = 0;
      let goodCount = 0;
      let passCount = 0;
      let failCount = 0;
      let totalHeight = 0;
      let totalWeight = 0;
      let totalBMI = 0;
      let totalVitalCapacity = 0;
      let validHeightCount = 0;
      let validWeightCount = 0;
      let validBMICount = 0;
      let validVitalCapacityCount = 0;

      if (sportDataList.length > 0) {
        const totalScore = sportDataList.reduce((sum, data) => sum + (data.totalScore || 0), 0);
        averageScore = totalScore / sportDataList.length;

        sportDataList.forEach(data => {
          const score = data.totalScore || 0;
          if (score >= 90) excellentCount++;
          else if (score >= 80) goodCount++;
          else if (score >= 60) passCount++;
          else failCount++;

          if (data.height) {
            totalHeight += data.height;
            validHeightCount++;
          }
          if (data.weight) {
            totalWeight += data.weight;
            validWeightCount++;
          }
          if (data.vitalCapacity) {
            totalVitalCapacity += data.vitalCapacity;
            validVitalCapacityCount++;
          }
        });
      }

      return {
        classID,
        className: classInfo.className,
        grade: classInfo.grade ? parseInt(classInfo.grade) : 0,
        totalStudents,
        submittedData,
        submissionRate: totalStudents > 0 ? (submittedData / totalStudents) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100,
        excellentCount,
        goodCount,
        passCount,
        failCount,
        averageHeight: validHeightCount > 0 ? Math.round((totalHeight / validHeightCount) * 10) / 10 : 0,
        averageWeight: validWeightCount > 0 ? Math.round((totalWeight / validWeightCount) * 10) / 10 : 0,
        averageBMI: validBMICount > 0 ? Math.round((totalBMI / validBMICount) * 100) / 100 : 0,
        averageVitalCapacity: validVitalCapacityCount > 0 ? Math.round(totalVitalCapacity / validVitalCapacityCount) : 0
      };
    } catch (error) {
      logger.error('Error getting class statistics:', error);
      throw error;
    }
  }

  /**
   * 获取年级统计信息
   */
  static async getGradeStatistics(grade: number, year: number): Promise<GradeStatistics> {
    try {
      // 获取年级班级总数
      const totalClasses = await ClassInfo.count({
        where: { grade: grade.toString() }
      });

      // 获取年级学生总数
      const totalStudents = await Student.count({
        include: [{
          model: ClassInfo,
          where: { grade: grade.toString() },
          attributes: []
        }]
      });

      // 获取已提交体测数据的学生数
      const submittedData = await SportData.count({
        where: { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        },
        include: [{
          model: Student,
          include: [{
            model: ClassInfo,
            where: { grade: grade.toString() },
            attributes: []
          }],
          attributes: []
        }]
      });

      // 获取体测数据进行统计
      const sportDataList = await SportData.findAll({
        where: { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        },
        include: [{
          model: Student,
          include: [{
            model: ClassInfo,
            where: { grade: grade.toString() },
            attributes: []
          }],
          attributes: []
        }],
        attributes: ['totalScore', 'height', 'weight', 'vitalCapacity', 'sitAndReach', 'fiftyRun', 'eightHundredRun']
      });

      let averageScore = 0;
      let excellentCount = 0;
      let goodCount = 0;
      let passCount = 0;
      let failCount = 0;

      if (sportDataList.length > 0) {
        const totalScore = sportDataList.reduce((sum, data) => sum + (data.totalScore || 0), 0);
        averageScore = totalScore / sportDataList.length;

        sportDataList.forEach(data => {
          const score = data.totalScore || 0;
          if (score >= 90) excellentCount++;
          else if (score >= 80) goodCount++;
          else if (score >= 60) passCount++;
          else failCount++;
        });
      }

      const submissionRate = totalStudents > 0 ? (submittedData / totalStudents) * 100 : 0;
      const excellentRate = submittedData > 0 ? (excellentCount / submittedData) * 100 : 0;
      const goodRate = submittedData > 0 ? (goodCount / submittedData) * 100 : 0;
      const passRate = submittedData > 0 ? (passCount / submittedData) * 100 : 0;
      const failRate = submittedData > 0 ? (failCount / submittedData) * 100 : 0;

      // 获取各项目统计
      const sportItemStats = await this.getSportItemStatistics(grade, year);

      return {
        grade,
        totalClasses,
        totalStudents,
        submittedData,
        submissionRate: Math.round(submissionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        excellentRate: Math.round(excellentRate * 100) / 100,
        goodRate: Math.round(goodRate * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        failRate: Math.round(failRate * 100) / 100,
        sportItemStats
      };
    } catch (error) {
      logger.error('Error getting grade statistics:', error);
      throw error;
    }
  }

  /**
   * 获取体测项目统计
   */
  static async getSportItemStatistics(grade: number, year: number): Promise<SportItemStatistics[]> {
    try {
      const sportItems = [
        { field: 'height', name: 'height', unit: 'cm' },
        { field: 'weight', name: 'weight', unit: 'kg' },
        { field: 'vitalCapacity', name: 'vitalCapacity', unit: 'ml' },
        { field: 'sitAndReach', name: 'sitAndReach', unit: 'cm' },
        { field: 'fiftyRun', name: 'fiftyRun', unit: '秒' }
      ];

      const stats: SportItemStatistics[] = [];

      for (const item of sportItems) {
        const sportDataList = await SportData.findAll({
          where: { 
            year: year,
            [item.field]: { [Op.ne]: null } as any
          },
          include: [{
            model: Student,
            include: [{
              model: ClassInfo,
              where: { grade: grade.toString() },
              attributes: []
            }],
            attributes: ['StuGender']
          }],
          attributes: [item.field]
        });

        if (sportDataList.length === 0) continue;

        const values = sportDataList.map(data => data[item.field as keyof SportData] as number).filter(v => v != null);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        // 计算等级分布
        let excellentCount = 0;
        let goodCount = 0;
        let passCount = 0;
        let failCount = 0;

        for (const data of sportDataList) {
          const value = data[item.field as keyof SportData] as number;
          const student = data.Student;
          if (!value || !student) continue;

          const result = await EvaluationStandardService.calculateGradeAndScore(
            year,
            grade,
            student.StuGender,
            item.name,
            value
          );

          if (result) {
            switch (result.grade) {
              case '优秀': excellentCount++; break;
              case '良好': goodCount++; break;
              case '及格': passCount++; break;
              default: failCount++; break;
            }
          }
        }

        stats.push({
          sportItem: item.name,
          unit: item.unit,
          average: Math.round(average * 100) / 100,
          max,
          min,
          excellentCount,
          goodCount,
          passCount,
          failCount
        });
      }

      return stats;
    } catch (error) {
      logger.error('Error getting sport item statistics:', error);
      throw error;
    }
  }

  /**
   * 获取趋势数据
   */
  static async getTrendData(grade?: number, startYear?: number, endYear?: number): Promise<TrendData[]> {
    try {
      const currentYear = new Date().getFullYear();
      const start = startYear || currentYear - 3;
      const end = endYear || currentYear;

      const trends: TrendData[] = [];

      for (let year = start; year <= end; year++) {
        const whereCondition: any = { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        };

        const includeCondition: any = [{
          model: Student,
          attributes: []
        }];

        if (grade !== undefined) {
          includeCondition[0].include = [{
            model: ClassInfo,
            where: { grade: grade.toString() },
            attributes: []
          }];
        }

        const sportDataList = await SportData.findAll({
          where: whereCondition,
          include: includeCondition,
          attributes: ['totalScore']
        });

        if (sportDataList.length === 0) {
          trends.push({
            year,
            averageScore: 0,
            excellentRate: 0,
            passRate: 0,
            totalStudents: 0
          });
          continue;
        }

        const totalScore = sportDataList.reduce((sum, data) => sum + (data.totalScore || 0), 0);
        const averageScore = totalScore / sportDataList.length;

        let excellentCount = 0;
        let passCount = 0;

        sportDataList.forEach(data => {
          const score = data.totalScore || 0;
          if (score >= 90) excellentCount++;
          if (score >= 60) passCount++;
        });

        const excellentRate = (excellentCount / sportDataList.length) * 100;
        const passRate = (passCount / sportDataList.length) * 100;

        trends.push({
          year,
          averageScore: Math.round(averageScore * 100) / 100,
          excellentRate: Math.round(excellentRate * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
          totalStudents: sportDataList.length
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error getting trend data:', error);
      throw error;
    }
  }

  /**
   * 获取整体统计信息
   */
  static async getOverallStatistics(year: number): Promise<OverallStatistics> {
    try {
      const totalStudents = await Student.count();
      const totalClasses = await ClassInfo.count();
      
      const grades = await ClassInfo.findAll({
        attributes: [[fn('DISTINCT', col('grade')), 'grade']],
        raw: true
      });
      const totalGrades = grades.length;

      const submittedData = await SportData.count({
        where: { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        }
      });

      const sportDataList = await SportData.findAll({
        where: { 
          year: year,
          totalScore: { [Op.ne]: null } as any
        },
        attributes: ['totalScore']
      });

      let averageScore = 0;
      let excellentCount = 0;
      let passCount = 0;

      if (sportDataList.length > 0) {
        const totalScore = sportDataList.reduce((sum, data) => sum + (data.totalScore || 0), 0);
        averageScore = totalScore / sportDataList.length;

        sportDataList.forEach(data => {
          const score = data.totalScore || 0;
          if (score >= 90) excellentCount++;
          if (score >= 60) passCount++;
        });
      }

      const submissionRate = totalStudents > 0 ? (submittedData / totalStudents) * 100 : 0;
      const excellentRate = submittedData > 0 ? (excellentCount / submittedData) * 100 : 0;
      const passRate = submittedData > 0 ? (passCount / submittedData) * 100 : 0;

      // 获取近几年趋势
      const recentTrends = await this.getTrendData(undefined, year - 2, year);

      return {
        totalStudents,
        totalClasses,
        totalGrades,
        submissionRate: Math.round(submissionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        excellentRate: Math.round(excellentRate * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        recentTrends
      };
    } catch (error) {
      logger.error('Error getting overall statistics:', error);
      throw error;
    }
  }

  /**
   * 获取多班级对比统计
   */
  static async getClassComparison(classIDs: number[], year: number): Promise<ClassStatistics[]> {
    try {
      const results: ClassStatistics[] = [];

      for (const classID of classIDs) {
        const stats = await this.getClassStatistics(classID, year);
        if (stats) {
          results.push(stats);
        }
      }

      return results.sort((a, b) => b.averageScore - a.averageScore);
    } catch (error) {
      logger.error('Error getting class comparison:', error);
      throw error;
    }
  }

  /**
   * 获取年级排名统计
   */
  static async getGradeRankings(year: number): Promise<GradeStatistics[]> {
    try {
      const grades = await ClassInfo.findAll({
        attributes: [[fn('DISTINCT', col('grade')), 'grade']],
        raw: true
      });

      const results: GradeStatistics[] = [];

      for (const gradeInfo of grades) {
        const grade = (gradeInfo as any).grade;
        const stats = await this.getGradeStatistics(grade, year);
        results.push(stats);
      }

      return results.sort((a, b) => b.averageScore - a.averageScore);
    } catch (error) {
      logger.error('Error getting grade rankings:', error);
      throw error;
    }
  }
}

export default AnalyticsService;