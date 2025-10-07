import { Router } from 'express';
import AnalyticsController from '../controllers/analyticsController';
import { authenticate, requireAdmin, requireClass } from '../middleware/auth';
import { param, query, body, validationResult } from 'express-validator';
import { ResponseUtils } from '../utils/helpers';

const router: Router = Router();

// 验证中间件
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', '请求参数验证失败', errors.array()));
  }
  next();
};

/**
 * @route GET /api/v1/analytics/dashboard/:year
 * @desc 获取仪表板数据
 * @access Private (Admin)
 */
router.get('/dashboard/:year', authenticate, requireAdmin, [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getDashboardData);

/**
 * @route GET /api/v1/analytics/overview/:year
 * @desc 获取整体统计信息
 * @access Private (Admin)
 */
router.get('/overview/:year', authenticate, requireAdmin, [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getOverallStatistics);

/**
 * @route GET /api/v1/analytics/class/:classID/year/:year
 * @desc 获取班级统计信息
 * @access Private (Admin/Class)
 */
router.get('/class/:classID/year/:year', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getClassStatistics);

/**
 * @route GET /api/v1/analytics/class/:classID/year/:year/detail
 * @desc 获取班级详细分析
 * @access Private (Admin/Class)
 */
router.get('/class/:classID/year/:year/detail', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getClassDetailAnalysis);

/**
 * @route GET /api/v1/analytics/grade/:grade/year/:year
 * @desc 获取年级统计信息
 * @access Private (Admin)
 */
router.get('/grade/:grade/year/:year', authenticate, requireAdmin, [
  param('grade')
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getGradeStatistics);

/**
 * @route GET /api/v1/analytics/grade/:grade/year/:year/detail
 * @desc 获取年级详细分析
 * @access Private (Admin)
 */
router.get('/grade/:grade/year/:year/detail', authenticate, requireAdmin, [
  param('grade')
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getGradeDetailAnalysis);

/**
 * @route GET /api/v1/analytics/grade/:grade/year/:year/sport-items
 * @desc 获取年级体测项目统计
 * @access Private (Admin)
 */
router.get('/grade/:grade/year/:year/sport-items', authenticate, requireAdmin, [
  param('grade')
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getSportItemStatistics);

/**
 * @route GET /api/v1/analytics/trends
 * @desc 获取趋势数据
 * @access Private (Admin)
 */
router.get('/trends', authenticate, requireAdmin, [
  query('grade')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  query('startYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('开始年份必须是2020-2030之间的整数'),
  query('endYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('结束年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getTrendData);

/**
 * @route POST /api/v1/analytics/class-comparison/:year
 * @desc 获取多班级对比统计
 * @access Private (Admin)
 */
router.post('/class-comparison/:year', authenticate, requireAdmin, [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('classIDs')
    .isArray({ min: 1, max: 10 })
    .withMessage('班级ID数组不能为空，最多支持10个班级对比'),
  body('classIDs.*')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
], validateRequest, AnalyticsController.getClassComparison);

/**
 * @route GET /api/v1/analytics/grade-rankings/:year
 * @desc 获取年级排名统计
 * @access Private (Admin)
 */
router.get('/grade-rankings/:year', authenticate, requireAdmin, [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
], validateRequest, AnalyticsController.getGradeRankings);

export default router;