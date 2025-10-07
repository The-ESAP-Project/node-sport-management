import SportData from '../models/SportData';
import Student from '../models/Student';
import ClassInfo from '../models/ClassInfo';
import { SportItem } from '../types/enums';
import { ValidationUtils } from '../utils/helpers';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class SportDataService {
  /**
   * 创建或更新学生体测数据
   */
  static async createOrUpdateSportData(
    studentID: number,
    year: number,
    sportData: {
      height?: number;
      weight?: number;
      vitalCapacity?: number;
      fiftyRun?: number;
      standingLongJump?: number;
      sitAndReach?: number;
      eightHundredRun?: number;
      oneThousandRun?: number;
      sitUp?: number;
      pullUp?: number;
    }
  ): Promise<SportData> {
    try {
      // 验证学生是否存在
      const student = await Student.findOne({
        where: { id: studentID, is_deleted: false },
        include: [{ model: ClassInfo }]
      });

      if (!student) {
        throw new Error('学生不存在');
      }

      // 验证体测数据范围
      for (const [item, value] of Object.entries(sportData)) {
        if (value !== undefined && value !== null) {
          const isValid = ValidationUtils.validateSportData(
            item as SportItem, 
            value as number, 
            student.StuGender
          );
          if (!isValid) {
            throw new Error(`${item}数值超出合理范围`);
          }
        }
      }

      // 查找是否已有该年份的数据
      let existingData = await SportData.findOne({
        where: {
          studentID,
          year
        }
      });

      let result: SportData;

      if (existingData) {
        // 更新现有数据
        await existingData.update({
          ...sportData,
          gradeID: student.ClassInfo?.academicYear || year,
          classID: student.classID
        });
        result = existingData;
      } else {
        // 创建新数据
        result = await SportData.create({
          studentID,
          year,
          gradeID: student.ClassInfo?.academicYear || year,
          classID: student.classID,
          ...sportData
        });
      }

      logger.business('Sport data updated', {
        studentID,
        year,
        dataItems: Object.keys(sportData)
      });

      return result;
    } catch (error: any) {
      logger.error('Error creating/updating sport data:', error);
      throw new Error(error.message || '更新体测数据失败');
    }
  }

  /**
   * 获取学生某年的体测数据
   */
  static async getStudentSportData(studentID: number, year: number): Promise<SportData | null> {
    try {
      const sportData = await SportData.findOne({
        where: {
          studentID,
          year
        },
        include: [
          {
            model: Student,
            include: [ClassInfo]
          }
        ]
      });

      return sportData;
    } catch (error) {
      logger.error('Error getting student sport data:', error);
      throw new Error('获取体测数据失败');
    }
  }

  /**
   * 获取班级体测数据统计
   */
  static async getClassSportDataStats(
    classID: number, 
    year: number
  ): Promise<{
    totalStudents: number;
    hasDataCount: number;
    avgScore: number;
    passCount: number;
    passRate: number;
    itemStats: Array<{
      item: string;
      avg: number;
      min: number;
      max: number;
      hasDataCount: number;
    }>;
  }> {
    try {
      // 获取班级所有学生
      const totalStudents = await Student.count({
        where: { classID, is_deleted: false }
      });

      // 获取有体测数据的学生数据
      const sportDataList = await SportData.findAll({
        where: { classID, year },
        include: [
          {
            model: Student,
            where: { is_deleted: false }
          }
        ]
      });

      const hasDataCount = sportDataList.length;
      
      // 计算平均分、及格率等
      const scores = sportDataList
        .filter(data => data.totalScore !== null && data.totalScore !== undefined)
        .map(data => data.totalScore!);

      const avgScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;

      const passCount = scores.filter(score => score >= 60).length;
      const passRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;

      // 计算各项目统计
      const items = [
        'height', 'weight', 'vitalCapacity', 'fiftyRun', 
        'standingLongJump', 'sitAndReach', 'eightHundredRun', 
        'oneThousandRun', 'sitUp', 'pullUp'
      ];

      const itemStats = items.map(item => {
        const values = sportDataList
          .map(data => (data as any)[item])
          .filter(value => value !== null && value !== undefined);

        return {
          item,
          avg: values.length > 0 ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
          hasDataCount: values.length
        };
      });

      return {
        totalStudents,
        hasDataCount,
        avgScore,
        passCount,
        passRate,
        itemStats
      };
    } catch (error) {
      logger.error('Error getting class sport data stats:', error);
      throw new Error('获取班级体测统计失败');
    }
  }

  /**
   * 获取年级体测数据趋势
   */
  static async getGradeTrend(
    gradeID: number, 
    startYear: number, 
    endYear: number
  ): Promise<{
    years: number[];
    avgScores: number[];
    passRates: number[];
    itemTrends: Array<{
      item: string;
      itemName: string;
      data: number[];
    }>;
  }> {
    try {
      const years = [];
      const avgScores = [];
      const passRates = [];
      
      // 初始化项目趋势数据
      const items = [
        { key: 'height', name: '身高' },
        { key: 'weight', name: '体重' },
        { key: 'vitalCapacity', name: '肺活量' },
        { key: 'fiftyRun', name: '50米跑' },
        { key: 'standingLongJump', name: '立定跳远' },
        { key: 'sitAndReach', name: '坐位体前屈' },
        { key: 'eightHundredRun', name: '800米跑' },
        { key: 'oneThousandRun', name: '1000米跑' },
        { key: 'sitUp', name: '仰卧起坐' },
        { key: 'pullUp', name: '引体向上' }
      ];

      const itemTrends = items.map(item => ({
        item: item.key,
        itemName: item.name,
        data: [] as number[]
      }));

      // 逐年计算统计数据
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);

        const yearData = await SportData.findAll({
          where: { gradeID, year },
          include: [
            {
              model: Student,
              where: { is_deleted: false }
            }
          ]
        });

        // 计算该年平均分
        const scores = yearData
          .filter(data => data.totalScore !== null && data.totalScore !== undefined)
          .map(data => data.totalScore!);

        const yearAvgScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;
        avgScores.push(yearAvgScore);

        // 计算该年及格率
        const passCount = scores.filter(score => score >= 60).length;
        const yearPassRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;
        passRates.push(yearPassRate);

        // 计算各项目年度平均值
        itemTrends.forEach((trend, index) => {
          const values = yearData
            .map(data => (data as any)[trend.item])
            .filter(value => value !== null && value !== undefined);
          
          const avg = values.length > 0 
            ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length 
            : 0;
          
          trend.data.push(avg);
        });
      }

      return {
        years,
        avgScores,
        passRates,
        itemTrends
      };
    } catch (error) {
      logger.error('Error getting grade trend:', error);
      throw new Error('获取年级趋势失败');
    }
  }

  /**
   * 计算排名
   */
  static async calculateRankings(year: number): Promise<void> {
    try {
      // 获取所有该年度的体测数据
      const allData = await SportData.findAll({
        where: { 
          year,
          totalScore: { [Op.not]: null } as any
        },
        include: [
          {
            model: Student,
            where: { is_deleted: false }
          }
        ],
        order: [['totalScore', 'DESC']]
      });

      // 按班级分组计算班级排名
      const classTotals: { [classID: number]: SportData[] } = {};
      allData.forEach(data => {
        if (!classTotals[data.classID]) {
          classTotals[data.classID] = [];
        }
        classTotals[data.classID].push(data);
      });

      // 按年级分组计算年级排名
      const gradeTotals: { [gradeID: number]: SportData[] } = {};
      allData.forEach(data => {
        if (!gradeTotals[data.gradeID]) {
          gradeTotals[data.gradeID] = [];
        }
        gradeTotals[data.gradeID].push(data);
      });

      // 更新班级排名
      for (const [classID, classData] of Object.entries(classTotals)) {
        const sortedClassData = classData.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        for (let i = 0; i < sortedClassData.length; i++) {
          await sortedClassData[i].update({ classRank: i + 1 });
        }
      }

      // 更新年级排名
      for (const [gradeID, gradeData] of Object.entries(gradeTotals)) {
        const sortedGradeData = gradeData.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        for (let i = 0; i < sortedGradeData.length; i++) {
          await sortedGradeData[i].update({ gradeRank: i + 1 });
        }
      }

      logger.business('Rankings calculated', {
        year,
        totalRecords: allData.length,
        classCount: Object.keys(classTotals).length,
        gradeCount: Object.keys(gradeTotals).length
      });
    } catch (error) {
      logger.error('Error calculating rankings:', error);
      throw new Error('计算排名失败');
    }
  }

  /**
   * 批量更新体测数据
   */
  static async batchUpdateSportData(
    dataList: Array<{
      studentID: number;
      year: number;
      sportData: any;
    }>
  ): Promise<{ success: number, failed: Array<{ studentID: number, error: string }> }> {
    let successCount = 0;
    const failed: Array<{ studentID: number, error: string }> = [];

    for (const item of dataList) {
      try {
        await this.createOrUpdateSportData(
          item.studentID,
          item.year,
          item.sportData
        );
        successCount++;
      } catch (error: any) {
        failed.push({
          studentID: item.studentID,
          error: error.message
        });
      }
    }

    logger.business('Batch update sport data completed', {
      successCount,
      failedCount: failed.length
    });

    return { success: successCount, failed };
  }
}

export default SportDataService;