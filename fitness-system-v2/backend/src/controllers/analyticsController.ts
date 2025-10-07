import { Request, Response } from 'express';
import AnalyticsService, { ClassStatistics } from '../services/analyticsService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

class AnalyticsController {
  /**
   * 获取班级统计信息
   */
  static async getClassStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { classID, year } = req.params;
      
      const stats = await AnalyticsService.getClassStatistics(
        parseInt(classID),
        parseInt(year)
      );
      
      if (!stats) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '班级不存在'));
        return;
      }
      
      res.json(ResponseUtils.success(stats, '获取班级统计成功'));
    } catch (error: any) {
      logger.error('Error in getClassStatistics:', error);
      
      if (error.message === '班级不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else {
        res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
      }
    }
  }

  /**
   * 获取年级统计信息
   */
  static async getGradeStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { grade, year } = req.params;
      
      const stats = await AnalyticsService.getGradeStatistics(
        parseInt(grade),
        parseInt(year)
      );
      
      res.json(ResponseUtils.success(stats, '获取年级统计成功'));
    } catch (error: any) {
      logger.error('Error in getGradeStatistics:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取体测项目统计
   */
  static async getSportItemStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { grade, year } = req.params;
      
      const stats = await AnalyticsService.getSportItemStatistics(
        parseInt(grade),
        parseInt(year)
      );
      
      res.json(ResponseUtils.success(stats, '获取体测项目统计成功'));
    } catch (error: any) {
      logger.error('Error in getSportItemStatistics:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取趋势数据
   */
  static async getTrendData(req: Request, res: Response): Promise<void> {
    try {
      const { grade, startYear, endYear } = req.query;
      
      const trends = await AnalyticsService.getTrendData(
        grade ? parseInt(grade as string) : undefined,
        startYear ? parseInt(startYear as string) : undefined,
        endYear ? parseInt(endYear as string) : undefined
      );
      
      res.json(ResponseUtils.success(trends, '获取趋势数据成功'));
    } catch (error: any) {
      logger.error('Error in getTrendData:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取整体统计信息
   */
  static async getOverallStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      
      const stats = await AnalyticsService.getOverallStatistics(parseInt(year));
      
      res.json(ResponseUtils.success(stats, '获取整体统计成功'));
    } catch (error: any) {
      logger.error('Error in getOverallStatistics:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取多班级对比统计
   */
  static async getClassComparison(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      const { classIDs } = req.body;
      
      if (!Array.isArray(classIDs) || classIDs.length === 0) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供有效的班级ID数组'));
        return;
      }

      const stats = await AnalyticsService.getClassComparison(
        classIDs.map(id => parseInt(id)),
        parseInt(year)
      );
      
      res.json(ResponseUtils.success(stats, '获取班级对比统计成功'));
    } catch (error: any) {
      logger.error('Error in getClassComparison:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取年级排名统计
   */
  static async getGradeRankings(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      
      const rankings = await AnalyticsService.getGradeRankings(parseInt(year));
      
      res.json(ResponseUtils.success(rankings, '获取年级排名统计成功'));
    } catch (error: any) {
      logger.error('Error in getGradeRankings:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取仪表板数据
   */
  static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      const yearNum = parseInt(year);
      
      // 并行获取各种统计数据
      const [
        overallStats,
        gradeRankings,
        recentTrends
      ] = await Promise.all([
        AnalyticsService.getOverallStatistics(yearNum),
        AnalyticsService.getGradeRankings(yearNum),
        AnalyticsService.getTrendData(undefined, yearNum - 2, yearNum)
      ]);

      const dashboardData = {
        overview: overallStats,
        gradeRankings: gradeRankings.slice(0, 5), // 只返回前5个年级
        trends: recentTrends,
        timestamp: new Date().toISOString()
      };
      
      res.json(ResponseUtils.success(dashboardData, '获取仪表板数据成功'));
    } catch (error: any) {
      logger.error('Error in getDashboardData:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取班级详细分析
   */
  static async getClassDetailAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { classID, year } = req.params;
      const classIDNum = parseInt(classID);
      const yearNum = parseInt(year);
      
      // 先获取班级统计
      const classStats: ClassStatistics | null = await AnalyticsService.getClassStatistics(classIDNum, yearNum);
      
      if (!classStats) {
        res.status(404).json({
          success: false,
          message: '班级统计数据未找到'
        });
        return;
      }
      
      // 再获取体测项目统计
      const sportItemStats = await AnalyticsService.getSportItemStatistics(classStats.grade, yearNum);

      // 获取班级历年趋势
      const classTrends = await AnalyticsService.getTrendData(
        classStats.grade,
        yearNum - 2,
        yearNum
      );

      const analysisData = {
        basicStats: classStats,
        sportItemStats,
        trends: classTrends,
        analysisTime: new Date().toISOString()
      };
      
      res.json(ResponseUtils.success(analysisData, '获取班级详细分析成功'));
    } catch (error: any) {
      logger.error('Error in getClassDetailAnalysis:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取年级详细分析
   */
  static async getGradeDetailAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { grade, year } = req.params;
      const gradeNum = parseInt(grade);
      const yearNum = parseInt(year);
      
      // 并行获取年级统计和趋势数据
      const [gradeStats, gradeTrends] = await Promise.all([
        AnalyticsService.getGradeStatistics(gradeNum, yearNum),
        AnalyticsService.getTrendData(gradeNum, yearNum - 2, yearNum)
      ]);

      const analysisData = {
        basicStats: gradeStats,
        trends: gradeTrends,
        analysisTime: new Date().toISOString()
      };
      
      res.json(ResponseUtils.success(analysisData, '获取年级详细分析成功'));
    } catch (error: any) {
      logger.error('Error in getGradeDetailAnalysis:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }
}

export default AnalyticsController;