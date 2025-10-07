import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';
import { ResponseUtils } from '../utils/helpers';
import { UserRole, UserStatus } from '../types/enums';

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
 * @route POST /api/users
 * @desc 创建用户（仅管理员）
 * @access Private (Admin)
 */
router.post('/', authenticate, requireAdmin, [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('用户名长度必须在1-50字符之间'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('无效的用户角色'),
  body('name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('姓名长度不能超过50字符'),
  body('className')
    .optional()
    .isLength({ max: 50 })
    .withMessage('班级名称长度不能超过50字符'),
  body('grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字')
], validateRequest, UserController.createUser);

/**
 * @route GET /api/users
 * @desc 获取用户列表（仅管理员）
 * @access Private (Admin)
 */
router.get('/', authenticate, requireAdmin, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('无效的用户角色'),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('无效的用户状态')
], validateRequest, UserController.getUsers);

/**
 * @route GET /api/users/class
 * @desc 获取班级账号列表（仅管理员）
 * @access Private (Admin)
 */
router.get('/class', authenticate, requireAdmin, [
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
  query('className')
    .optional()
    .isLength({ max: 50 })
    .withMessage('班级名称长度不能超过50字符')
], validateRequest, UserController.getClassUsers);

/**
 * @route GET /api/users/:id
 * @desc 根据ID获取用户详情（仅管理员）
 * @access Private (Admin)
 */
router.get('/:id', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是大于0的整数')
], validateRequest, UserController.getUserById);

/**
 * @route PUT /api/users/:id/status
 * @desc 更新用户状态（仅管理员）
 * @access Private (Admin)
 */
router.put('/:id/status', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是大于0的整数'),
  body('status')
    .isIn(Object.values(UserStatus))
    .withMessage('无效的用户状态')
], validateRequest, UserController.updateUserStatus);

/**
 * @route PUT /api/users/:id/reset-password
 * @desc 重置用户密码（仅管理员）
 * @access Private (Admin)
 */
router.put('/:id/reset-password', authenticate, requireAdmin, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是大于0的整数'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('新密码必须包含字母和数字')
], validateRequest, UserController.resetPassword);

/**
 * @route POST /api/users/batch/class
 * @desc 批量创建班级账号（仅管理员）
 * @access Private (Admin)
 */
router.post('/batch/class', authenticate, requireAdmin, [
  body('users')
    .isArray({ min: 1 })
    .withMessage('用户数据必须是非空数组'),
  body('users.*.username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .matches(/^\d{4}-.+$/)
    .withMessage('班级账号用户名格式不正确（应为：年级-班级名）'),
  body('users.*.password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('users.*.name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('姓名长度不能超过50字符'),
  body('users.*.className')
    .optional()
    .isLength({ max: 50 })
    .withMessage('班级名称长度不能超过50字符'),
  body('users.*.grade')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字')
], validateRequest, UserController.batchCreateClassUsers);

export default router;