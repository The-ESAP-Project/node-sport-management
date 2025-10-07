import { Router } from 'express';
import ClassController from '../controllers/classController';
import { authenticate, requireAdmin, checkClassAccess } from '../middleware/auth';
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
 * @route POST /api/classes
 * @desc 创建班级（仅管理员）
 * @access Private (Admin)
 */
router.post('/', authenticate, requireAdmin, [
  body('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  body('className')
    .notEmpty()
    .withMessage('班级名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('班级名称长度必须在1-50字符之间'),
  body('academicYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('学年必须是2020-2030之间的整数'),
  body('grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字'),
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('院系名称长度不能超过50字符')
], validateRequest, ClassController.createClass);

/**
 * @route GET /api/classes
 * @desc 获取班级列表
 * @access Private
 */
router.get('/', authenticate, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  query('grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字'),
  query('academicYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('学年必须是2020-2030之间的整数'),
  query('search')
    .optional()
    .isLength({ max: 50 })
    .withMessage('搜索关键字长度不能超过50字符')
], validateRequest, ClassController.getClasses);

/**
 * @route GET /api/classes/grades
 * @desc 获取年级列表
 * @access Private
 */
router.get('/grades', authenticate, ClassController.getGrades);

/**
 * @route GET /api/classes/academic-years
 * @desc 获取学年列表
 * @access Private
 */
router.get('/academic-years', authenticate, ClassController.getAcademicYears);

/**
 * @route GET /api/classes/grade/:grade
 * @desc 根据年级获取班级列表
 * @access Private
 */
router.get('/grade/:grade', authenticate, [
  param('grade')
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字')
], validateRequest, ClassController.getClassesByGrade);

/**
 * @route GET /api/classes/:id
 * @desc 根据ID获取班级详情
 * @access Private
 */
router.get('/:id', authenticate, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是大于0的整数')
], validateRequest, ClassController.getClassById);

/**
 * @route GET /api/classes/:id/stats
 * @desc 获取班级统计信息
 * @access Private
 */
router.get('/:id/stats', authenticate, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是大于0的整数')
], validateRequest, ClassController.getClassStats);

/**
 * @route PUT /api/classes/:id
 * @desc 更新班级信息（仅管理员）
 * @access Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是大于0的整数'),
  body('className')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('班级名称长度必须在1-50字符之间'),
  body('academicYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('学年必须是2020-2030之间的整数'),
  body('grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字'),
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('院系名称长度不能超过50字符')
], validateRequest, ClassController.updateClass);

/**
 * @route DELETE /api/classes/:id
 * @desc 删除班级（仅管理员）
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是大于0的整数')
], validateRequest, ClassController.deleteClass);

/**
 * @route POST /api/classes/batch
 * @desc 批量创建班级（仅管理员）
 * @access Private (Admin)
 */
router.post('/batch', authenticate, requireAdmin, [
  body('classes')
    .isArray({ min: 1 })
    .withMessage('班级数据必须是非空数组'),
  body('classes.*.classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  body('classes.*.className')
    .notEmpty()
    .withMessage('班级名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('班级名称长度必须在1-50字符之间'),
  body('classes.*.academicYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('学年必须是2020-2030之间的整数'),
  body('classes.*.grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字'),
  body('classes.*.department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('院系名称长度不能超过50字符')
], validateRequest, ClassController.batchCreateClasses);

export default router;