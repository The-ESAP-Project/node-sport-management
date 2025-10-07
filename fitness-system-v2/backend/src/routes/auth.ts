import { Router } from 'express';
import AuthController from '../controllers/authController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
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
 * @route POST /api/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('用户名长度必须在1-50字符之间'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
], validateRequest, AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc 用户登出
 * @access Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route GET /api/auth/me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * @route POST /api/auth/refresh-token
 * @desc 刷新访问令牌
 * @access Public
 */
router.post('/refresh-token', [
  body('refreshToken')
    .notEmpty()
    .withMessage('刷新令牌不能为空')
], validateRequest, AuthController.refreshToken);

/**
 * @route POST /api/auth/change-password
 * @desc 修改密码
 * @access Private
 */
router.post('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('新密码必须包含字母和数字')
], validateRequest, AuthController.changePassword);

/**
 * @route POST /api/auth/validate-token
 * @desc 验证令牌有效性
 * @access Public
 */
router.post('/validate-token', [
  body('token')
    .notEmpty()
    .withMessage('令牌不能为空')
], validateRequest, AuthController.validateToken);

export default router;