import { Router } from 'express';
import SystemConfigController from '../controllers/systemConfigController';
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
 * @route GET /api/v1/system-config/public
 * @desc 获取公开配置
 * @access Public
 */
router.get('/public', SystemConfigController.getPublicConfigs);

/**
 * @route GET /api/v1/system-config/overview
 * @desc 获取系统概览
 * @access Private (Admin)
 */
router.get('/overview', authenticate, requireAdmin, SystemConfigController.getSystemOverview);

/**
 * @route GET /api/v1/system-config/categories
 * @desc 获取配置分类列表
 * @access Private (Admin)
 */
router.get('/categories', authenticate, requireAdmin, SystemConfigController.getCategories);

/**
 * @route POST /api/v1/system-config
 * @desc 创建系统配置
 * @access Private (Admin)
 */
router.post('/', authenticate, requireAdmin, [
  body('key')
    .notEmpty()
    .withMessage('配置键不能为空')
    .isLength({ max: 100 })
    .withMessage('配置键长度不能超过100个字符')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('配置键只能包含字母、数字、点、下划线和连字符'),
  body('value')
    .exists()
    .withMessage('配置值不能为空'),
  body('type')
    .isIn(['string', 'number', 'boolean', 'json', 'date'])
    .withMessage('类型必须是string、number、boolean、json或date'),
  body('category')
    .notEmpty()
    .withMessage('配置分类不能为空')
    .isLength({ max: 50 })
    .withMessage('配置分类长度不能超过50个字符'),
  body('name')
    .notEmpty()
    .withMessage('配置名称不能为空')
    .isLength({ max: 100 })
    .withMessage('配置名称长度不能超过100个字符'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('配置描述长度不能超过500个字符'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('是否公开必须是布尔值'),
  body('is_readonly')
    .optional()
    .isBoolean()
    .withMessage('是否只读必须是布尔值'),
], validateRequest, SystemConfigController.createConfig);

/**
 * @route GET /api/v1/system-config
 * @desc 获取系统配置列表
 * @access Private (Admin)
 */
router.get('/', authenticate, requireAdmin, [
  query('category')
    .optional()
    .isString()
    .withMessage('分类必须是字符串'),
  query('is_public')
    .optional()
    .isBoolean()
    .withMessage('是否公开必须是布尔值'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
], validateRequest, SystemConfigController.getConfigs);

/**
 * @route POST /api/v1/system-config/multiple
 * @desc 批量获取配置
 * @access Private (Admin)
 */
router.post('/multiple', authenticate, requireAdmin, [
  body('keys')
    .isArray({ min: 1, max: 50 })
    .withMessage('配置键数组不能为空，最多支持50个配置键'),
  body('keys.*')
    .isString()
    .withMessage('配置键必须是字符串'),
], validateRequest, SystemConfigController.getMultipleConfigs);

/**
 * @route POST /api/v1/system-config/init-defaults
 * @desc 初始化默认配置
 * @access Private (Admin)
 */
router.post('/init-defaults', authenticate, requireAdmin, SystemConfigController.initializeDefaults);

/**
 * @route DELETE /api/v1/system-config/cache
 * @desc 清除配置缓存
 * @access Private (Admin)
 */
router.delete('/cache', authenticate, requireAdmin, SystemConfigController.clearConfigCache);

/**
 * @route GET /api/v1/system-config/category/:category
 * @desc 按分类获取配置
 * @access Private (Admin)
 */
router.get('/category/:category', authenticate, requireAdmin, [
  param('category')
    .notEmpty()
    .withMessage('配置分类不能为空'),
], validateRequest, SystemConfigController.getConfigsByCategory);

/**
 * @route GET /api/v1/system-config/:key
 * @desc 根据键获取配置
 * @access Private (Admin)
 */
router.get('/:key', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
], validateRequest, SystemConfigController.getConfigByKey);

/**
 * @route PUT /api/v1/system-config/:key
 * @desc 更新系统配置
 * @access Private (Admin)
 */
router.put('/:key', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('配置名称长度不能超过100个字符'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('配置描述长度不能超过500个字符'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('是否公开必须是布尔值'),
  body('is_readonly')
    .optional()
    .isBoolean()
    .withMessage('是否只读必须是布尔值'),
], validateRequest, SystemConfigController.updateConfig);

/**
 * @route DELETE /api/v1/system-config/:key
 * @desc 删除系统配置
 * @access Private (Admin)
 */
router.delete('/:key', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
], validateRequest, SystemConfigController.deleteConfig);

/**
 * @route GET /api/v1/system-config/:key/value
 * @desc 获取配置值
 * @access Private (Admin)
 */
router.get('/:key/value', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
  query('defaultValue')
    .optional()
    .isString()
    .withMessage('默认值必须是字符串'),
], validateRequest, SystemConfigController.getValue);

/**
 * @route PUT /api/v1/system-config/:key/value
 * @desc 设置配置值
 * @access Private (Admin)
 */
router.put('/:key/value', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
  body('value')
    .exists()
    .withMessage('配置值不能为空'),
], validateRequest, SystemConfigController.setValue);

/**
 * @route POST /api/v1/system-config/:key/reset
 * @desc 重置配置到默认值
 * @access Private (Admin)
 */
router.post('/:key/reset', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('配置键不能为空'),
], validateRequest, SystemConfigController.resetToDefault);

export default router;