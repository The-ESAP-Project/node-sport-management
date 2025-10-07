import { Router } from 'express';
import SportDataController from '../controllers/sportDataController';
import { authenticate, requireAdmin, requireClass } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';
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
 * @route PUT /api/sport-data/student/:studentID/year/:year
 * @desc 创建或更新学生体测数据
 * @access Private (Admin/Class)
 */
router.put('/student/:studentID/year/:year', authenticate, requireClass, [
  param('studentID')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('height')
    .optional()
    .isFloat({ min: 120, max: 220 })
    .withMessage('身高必须在120-220cm之间'),
  body('weight')
    .optional()
    .isFloat({ min: 25, max: 200 })
    .withMessage('体重必须在25-200kg之间'),
  body('vitalCapacity')
    .optional()
    .isInt({ min: 500, max: 8000 })
    .withMessage('肺活量必须在500-8000mL之间'),
  body('fiftyRun')
    .optional()
    .isFloat({ min: 5, max: 20 })
    .withMessage('50米跑时间必须在5-20秒之间'),
  body('standingLongJump')
    .optional()
    .isInt({ min: 50, max: 350 })
    .withMessage('立定跳远必须在50-350cm之间'),
  body('sitAndReach')
    .optional()
    .isFloat({ min: -10, max: 35 })
    .withMessage('坐位体前屈必须在-10-35cm之间'),
  body('eightHundredRun')
    .optional()
    .isInt({ min: 120, max: 800 })
    .withMessage('800米跑时间必须在120-800秒之间'),
  body('oneThousandRun')
    .optional()
    .isInt({ min: 150, max: 1000 })
    .withMessage('1000米跑时间必须在150-1000秒之间'),
  body('sitUp')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('仰卧起坐必须在0-100个之间'),
  body('pullUp')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('引体向上必须在0-50个之间')
], validateRequest, SportDataController.createOrUpdateSportData);

/**
 * @route GET /api/sport-data/student/:studentID/year/:year
 * @desc 获取学生某年的体测数据
 * @access Private (Admin/Class)
 */
router.get('/student/:studentID/year/:year', authenticate, requireClass, [
  param('studentID')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数')
], validateRequest, SportDataController.getStudentSportData);

/**
 * @route GET /api/sport-data/class/:classID/year/:year/stats
 * @desc 获取班级体测数据统计
 * @access Private (Admin/Class)
 */
router.get('/class/:classID/year/:year/stats', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数')
], validateRequest, SportDataController.getClassSportDataStats);

/**
 * @route GET /api/sport-data/grade/:gradeID/trend
 * @desc 获取年级体测数据趋势
 * @access Private (Admin)
 */
router.get('/grade/:gradeID/trend', authenticate, requireAdmin, [
  param('gradeID')
    .isInt({ min: 1 })
    .withMessage('年级ID必须是正整数'),
  query('startYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('开始年份必须是2020-2030之间的整数'),
  query('endYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('结束年份必须是2020-2030之间的整数')
], validateRequest, SportDataController.getGradeTrend);

/**
 * @route POST /api/sport-data/rankings/year/:year
 * @desc 计算指定年份的排名
 * @access Private (Admin)
 */
router.post('/rankings/year/:year', authenticate, requireAdmin, [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数')
], validateRequest, SportDataController.calculateRankings);

/**
 * @route POST /api/sport-data/batch/update
 * @desc 批量更新体测数据
 * @access Private (Admin/Class)
 */
router.post('/batch/update', authenticate, requireClass, [
  body('dataList')
    .isArray({ min: 1 })
    .withMessage('数据列表必须是非空数组'),
  body('dataList.*.studentID')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数'),
  body('dataList.*.year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('dataList.*.sportData')
    .isObject()
    .withMessage('体测数据必须是对象')
], validateRequest, SportDataController.batchUpdateSportData);

/**
 * @route GET /api/sport-data/items
 * @desc 获取体测项目列表
 * @access Private
 */
router.get('/items', authenticate, SportDataController.getSportItems);

/**
 * @route POST /api/sport-data/validate
 * @desc 验证体测数据
 * @access Private (Admin/Class)
 */
router.post('/validate', authenticate, requireClass, [
  body('sportData')
    .isObject()
    .withMessage('体测数据必须是对象'),
  body('gender')
    .isIn(['0', '1'])
    .withMessage('性别必须是0（女）或1（男）')
], validateRequest, SportDataController.validateSportData);

/**
 * @route GET /api/sport-data/export/class/:classID/year/:year
 * @desc 导出班级体测数据
 * @access Private (Admin/Class)
 */
router.get('/export/class/:classID/year/:year', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  query('format')
    .optional()
    .isIn(['excel', 'csv', 'pdf'])
    .withMessage('格式必须是excel、csv或pdf')
], validateRequest, SportDataController.exportClassSportData);

export default router;