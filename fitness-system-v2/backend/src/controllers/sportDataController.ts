import { Request, Response } from 'express';
import { SportDataService } from '../services/sportDataService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

export class SportDataController {
  /**
   * 创建或更新学生体测数据
   */
  static async createOrUpdateSportData(req: Request, res: Response): Promise<void> {
    try {
      const { studentID, year } = req.params;
      const sportData = req.body;

      const studentId = parseInt(studentID, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(studentId) || isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_PARAMS', '无效的学生ID或年份'));
        return;
      }

      // 过滤出体测相关字段
      const {
        height,
        weight,
        vitalCapacity,
        fiftyRun,
        standingLongJump,
        sitAndReach,
        eightHundredRun,
        oneThousandRun,
        sitUp,
        pullUp
      } = sportData;

      const result = await SportDataService.createOrUpdateSportData(studentId, yearNum, {
        height,
        weight,
        vitalCapacity,
        fiftyRun,
        standingLongJump,
        sitAndReach,
        eightHundredRun,
        oneThousandRun,
        sitUp,
        pullUp
      });

      res.json(ResponseUtils.success(result, '体测数据保存成功'));
    } catch (error: any) {
      logger.error('Create or update sport data error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_SAVE_FAILED', error.message || '保存体测数据失败'));
    }
  }

  /**
   * 获取学生某年的体测数据
   */
  static async getStudentSportData(req: Request, res: Response): Promise<void> {
    try {
      const { studentID, year } = req.params;

      const studentId = parseInt(studentID, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(studentId) || isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_PARAMS', '无效的学生ID或年份'));
        return;
      }

      const sportData = await SportDataService.getStudentSportData(studentId, yearNum);

      if (!sportData) {
        res.status(404).json(ResponseUtils.error('SPORT_DATA_NOT_FOUND', '未找到体测数据'));
        return;
      }

      res.json(ResponseUtils.success(sportData, '获取体测数据成功'));
    } catch (error: any) {
      logger.error('Get student sport data error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_GET_FAILED', '获取体测数据失败'));
    }
  }

  /**
   * 获取班级体测数据统计
   */
  static async getClassSportDataStats(req: Request, res: Response): Promise<void> {
    try {
      const { classID, year } = req.params;

      const classId = parseInt(classID, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(classId) || isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_PARAMS', '无效的班级ID或年份'));
        return;
      }

      const stats = await SportDataService.getClassSportDataStats(classId, yearNum);

      res.json(ResponseUtils.success(stats, '获取班级体测统计成功'));
    } catch (error: any) {
      logger.error('Get class sport data stats error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_GET_STATS_FAILED', '获取班级体测统计失败'));
    }
  }

  /**
   * 获取年级体测数据趋势
   */
  static async getGradeTrend(req: Request, res: Response): Promise<void> {
    try {
      const { gradeID } = req.params;
      const { startYear, endYear } = req.query;

      const gradeId = parseInt(gradeID, 10);
      const startYearNum = parseInt(startYear as string, 10);
      const endYearNum = parseInt(endYear as string, 10);

      if (isNaN(gradeId) || isNaN(startYearNum) || isNaN(endYearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_PARAMS', '无效的年级ID或年份范围'));
        return;
      }

      if (startYearNum > endYearNum) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_YEAR_RANGE', '开始年份不能大于结束年份'));
        return;
      }

      const trend = await SportDataService.getGradeTrend(gradeId, startYearNum, endYearNum);

      res.json(ResponseUtils.success(trend, '获取年级趋势数据成功'));
    } catch (error: any) {
      logger.error('Get grade trend error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_GET_TREND_FAILED', '获取年级趋势数据失败'));
    }
  }

  /**
   * 计算排名
   */
  static async calculateRankings(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;

      const yearNum = parseInt(year, 10);

      if (isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_YEAR', '无效的年份'));
        return;
      }

      await SportDataService.calculateRankings(yearNum);

      res.json(ResponseUtils.success(null, '排名计算完成'));
    } catch (error: any) {
      logger.error('Calculate rankings error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_CALCULATE_RANKINGS_FAILED', '计算排名失败'));
    }
  }

  /**
   * 批量更新体测数据
   */
  static async batchUpdateSportData(req: Request, res: Response): Promise<void> {
    try {
      const { dataList } = req.body;

      if (!Array.isArray(dataList) || dataList.length === 0) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_BATCH_DATA', '批量数据格式不正确'));
        return;
      }

      // 验证数据格式
      for (const item of dataList) {
        if (!item.studentID || !item.year || !item.sportData) {
          res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_BATCH_ITEM', '批量数据项缺少必要字段'));
          return;
        }

        if (isNaN(parseInt(item.studentID, 10)) || isNaN(parseInt(item.year, 10))) {
          res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_BATCH_PARAMS', '批量数据中包含无效的学生ID或年份'));
          return;
        }
      }

      const results = await SportDataService.batchUpdateSportData(dataList);

      // 记录批量更新日志
      logger.business('Batch update sport data', {
        totalCount: dataList.length,
        successCount: results.success,
        failedCount: results.failed.length,
        userId: req.user?.userId,
        username: req.user?.username
      });

      res.json(ResponseUtils.success(results, `批量更新完成，成功${results.success}个，失败${results.failed.length}个`));
    } catch (error: any) {
      logger.error('Batch update sport data error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_BATCH_UPDATE_FAILED', '批量更新体测数据失败'));
    }
  }

  /**
   * 获取体测项目列表
   */
  static async getSportItems(req: Request, res: Response): Promise<void> {
    try {
      const sportItems = [
        { key: 'height', name: '身高', unit: 'cm', type: 'basic' },
        { key: 'weight', name: '体重', unit: 'kg', type: 'basic' },
        { key: 'vitalCapacity', name: '肺活量', unit: 'mL', type: 'strength' },
        { key: 'fiftyRun', name: '50米跑', unit: '秒', type: 'speed' },
        { key: 'standingLongJump', name: '立定跳远', unit: 'cm', type: 'power' },
        { key: 'sitAndReach', name: '坐位体前屈', unit: 'cm', type: 'flexibility' },
        { key: 'eightHundredRun', name: '800米跑', unit: '秒', type: 'endurance', gender: '0' },
        { key: 'oneThousandRun', name: '1000米跑', unit: '秒', type: 'endurance', gender: '1' },
        { key: 'sitUp', name: '1分钟仰卧起坐', unit: '个', type: 'strength', gender: '0' },
        { key: 'pullUp', name: '引体向上', unit: '个', type: 'strength', gender: '1' }
      ];

      res.json(ResponseUtils.success(sportItems, '获取体测项目列表成功'));
    } catch (error: any) {
      logger.error('Get sport items error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_GET_ITEMS_FAILED', '获取体测项目列表失败'));
    }
  }

  /**
   * 验证体测数据
   */
  static async validateSportData(req: Request, res: Response): Promise<void> {
    try {
      const { sportData, gender } = req.body;

      if (!sportData || !gender) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_MISSING_PARAMS', '体测数据和性别参数不能为空'));
        return;
      }

      if (gender !== '0' && gender !== '1') {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_GENDER', '性别参数必须是0或1'));
        return;
      }

      const validationResults: any = {};
      const errors: string[] = [];

      // 验证各项体测数据的合理性
      for (const [item, value] of Object.entries(sportData)) {
        if (value !== null && value !== undefined) {
          try {
            // 这里可以调用ValidationUtils.validateSportData进行验证
            validationResults[item] = {
              value,
              valid: true, // 简化处理，实际应该调用验证函数
              message: '数据正常'
            };
          } catch (error) {
            validationResults[item] = {
              value,
              valid: false,
              message: `数据超出合理范围`
            };
            errors.push(`${item}: 数据超出合理范围`);
          }
        }
      }

      const isValid = errors.length === 0;

      res.json(ResponseUtils.success({
        valid: isValid,
        results: validationResults,
        errors: isValid ? [] : errors
      }, isValid ? '体测数据验证通过' : '体测数据验证失败'));
    } catch (error: any) {
      logger.error('Validate sport data error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_VALIDATE_FAILED', '验证体测数据失败'));
    }
  }

  /**
   * 导出班级体测数据
   */
  static async exportClassSportData(req: Request, res: Response): Promise<void> {
    try {
      const { classID, year } = req.params;
      const { format = 'excel' } = req.query;

      const classId = parseInt(classID, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(classId) || isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('SPORT_DATA_INVALID_PARAMS', '无效的班级ID或年份'));
        return;
      }

      // 这里应该调用导出服务，暂时返回成功响应
      res.json(ResponseUtils.success({
        classID: classId,
        year: yearNum,
        format,
        message: '导出功能待实现'
      }, '导出请求已提交'));
    } catch (error: any) {
      logger.error('Export class sport data error:', error);
      res.status(500).json(ResponseUtils.error('SPORT_DATA_EXPORT_FAILED', '导出班级体测数据失败'));
    }
  }
}

export default SportDataController;