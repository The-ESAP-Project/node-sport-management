import { Router } from 'express';
import EvaluationStandardController from '../controllers/evaluationStandardController';
import { authenticate, requireAdmin } from '../middleware/auth';
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
 * @route POST /api/v1/evaluation-standards
 * @desc 创建评分标准
 * @access Private (Admin)
 */
router.post('/', authenticate, requireAdmin, [
  body('name')
    .notEmpty()
    .withMessage('标准名称不能为空')
    .isLength({ max: 100 })
    .withMessage('标准名称长度不能超过100个字符'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('grade_min')
    .isInt({ min: 1, max: 12 })
    .withMessage('最小年级必须是1-12之间的整数'),
  body('grade_max')
    .isInt({ min: 1, max: 12 })
    .withMessage('最大年级必须是1-12之间的整数'),
  body('gender')
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  body('sport_item')
    .notEmpty()
    .withMessage('体测项目不能为空')
    .isLength({ max: 50 })
    .withMessage('体测项目长度不能超过50个字符'),
  body('is_time_based')
    .isBoolean()
    .withMessage('是否为时间类型必须是布尔值'),
  body('unit')
    .notEmpty()
    .withMessage('单位不能为空')
    .isLength({ max: 20 })
    .withMessage('单位长度不能超过20个字符'),
  body('excellent_min')
    .optional()
    .isNumeric()
    .withMessage('优秀最低标准必须是数字'),
  body('good_min')
    .optional()
    .isNumeric()
    .withMessage('良好最低标准必须是数字'),
  body('pass_min')
    .optional()
    .isNumeric()
    .withMessage('及格最低标准必须是数字'),
  body('fail_max')
    .optional()
    .isNumeric()
    .withMessage('不及格最高标准必须是数字'),
], validateRequest, EvaluationStandardController.createStandard);

/**
 * @route GET /api/v1/evaluation-standards
 * @desc 获取评分标准列表
 * @access Private
 */
router.get('/', authenticate, [
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  query('grade')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  query('gender')
    .optional()
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('是否启用必须是布尔值'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
], validateRequest, EvaluationStandardController.getStandards);

/**
 * @route GET /api/v1/evaluation-standards/sport-items
 * @desc 获取支持的体测项目列表
 * @access Private
 */
router.get('/sport-items', authenticate, EvaluationStandardController.getSportItems);

/**
 * @route GET /api/v1/evaluation-standards/applicable
 * @desc 获取适用的评分标准
 * @access Private
 */
router.get('/applicable', authenticate, [
  query('year')
    .notEmpty()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  query('grade')
    .notEmpty()
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  query('gender')
    .notEmpty()
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  query('sport_item')
    .notEmpty()
    .withMessage('体测项目不能为空'),
], validateRequest, EvaluationStandardController.getApplicableStandard);

/**
 * @route POST /api/v1/evaluation-standards/calculate
 * @desc 计算体测成绩等级和分数
 * @access Private
 */
router.post('/calculate', authenticate, [
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('grade')
    .isInt({ min: 1, max: 12 })
    .withMessage('年级必须是1-12之间的整数'),
  body('gender')
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  body('sport_item')
    .notEmpty()
    .withMessage('体测项目不能为空'),
  body('value')
    .isNumeric()
    .withMessage('成绩值必须是数字'),
], validateRequest, EvaluationStandardController.calculateGradeAndScore);

/**
 * @route GET /api/v1/evaluation-standards/:id
 * @desc 根据ID获取评分标准
 * @access Private
 */
router.get('/:id', authenticate, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('评分标准ID必须是正整数'),
], validateRequest, EvaluationStandardController.getStandardById);

/**
 * @route PUT /api/v1/evaluation-standards/:id
 * @desc 更新评分标准
 * @access Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('评分标准ID必须是正整数'),
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('标准名称长度不能超过100个字符'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('grade_min')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('最小年级必须是1-12之间的整数'),
  body('grade_max')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('最大年级必须是1-12之间的整数'),
  body('gender')
    .optional()
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  body('sport_item')
    .optional()
    .isLength({ max: 50 })
    .withMessage('体测项目长度不能超过50个字符'),
  body('is_time_based')
    .optional()
    .isBoolean()
    .withMessage('是否为时间类型必须是布尔值'),
  body('unit')
    .optional()
    .isLength({ max: 20 })
    .withMessage('单位长度不能超过20个字符'),
  body('excellent_min')
    .optional()
    .isNumeric()
    .withMessage('优秀最低标准必须是数字'),
  body('good_min')
    .optional()
    .isNumeric()
    .withMessage('良好最低标准必须是数字'),
  body('pass_min')
    .optional()
    .isNumeric()
    .withMessage('及格最低标准必须是数字'),
  body('fail_max')
    .optional()
    .isNumeric()
    .withMessage('不及格最高标准必须是数字'),
], validateRequest, EvaluationStandardController.updateStandard);

/**
 * @route DELETE /api/v1/evaluation-standards/:id
 * @desc 删除评分标准
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('评分标准ID必须是正整数'),
], validateRequest, EvaluationStandardController.deleteStandard);

/**
 * @route PUT /api/v1/evaluation-standards/:id/status
 * @desc 启用/禁用评分标准
 * @access Private (Admin)
 */
router.put('/:id/status', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('评分标准ID必须是正整数'),
  body('is_active')
    .isBoolean()
    .withMessage('是否启用必须是布尔值'),
], validateRequest, EvaluationStandardController.toggleStandardStatus);

/**
 * @route POST /api/v1/evaluation-standards/batch
 * @desc 批量创建评分标准
 * @access Private (Admin)
 */
router.post('/batch', authenticate, requireAdmin, [
  body('standards')
    .isArray({ min: 1 })
    .withMessage('评分标准数组不能为空'),
  body('standards.*.name')
    .notEmpty()
    .withMessage('标准名称不能为空'),
  body('standards.*.year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数'),
  body('standards.*.grade_min')
    .isInt({ min: 1, max: 12 })
    .withMessage('最小年级必须是1-12之间的整数'),
  body('standards.*.grade_max')
    .isInt({ min: 1, max: 12 })
    .withMessage('最大年级必须是1-12之间的整数'),
  body('standards.*.gender')
    .isIn(['0', '1'])
    .withMessage('性别只能是0（女）或1（男）'),
  body('standards.*.sport_item')
    .notEmpty()
    .withMessage('体测项目不能为空'),
  body('standards.*.is_time_based')
    .isBoolean()
    .withMessage('是否为时间类型必须是布尔值'),
  body('standards.*.unit')
    .notEmpty()
    .withMessage('单位不能为空'),
], validateRequest, EvaluationStandardController.batchCreateStandards);

export default router;