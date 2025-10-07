import { Router } from 'express';
import CacheController from '../controllers/cacheController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { param, body, query, validationResult } from 'express-validator';
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
 * @route GET /api/v1/cache/health
 * @desc 缓存健康检查
 * @access Private (Admin)
 */
router.get('/health', authenticate, requireAdmin, CacheController.healthCheck);

/**
 * @route GET /api/v1/cache/stats
 * @desc 获取缓存统计信息
 * @access Private (Admin)
 */
router.get('/stats', authenticate, requireAdmin, CacheController.getCacheStats);

/**
 * @route POST /api/v1/cache/clear
 * @desc 清理缓存
 * @access Private (Admin)
 */
router.post('/clear', authenticate, requireAdmin, [
  body('type')
    .isIn(['analytics', 'previews', 'all'])
    .withMessage('缓存类型只能是analytics、previews或all'),
], validateRequest, CacheController.clearAllCache);

/**
 * @route POST /api/v1/cache/batch-clear
 * @desc 批量清理缓存
 * @access Private (Admin)
 */
router.post('/batch-clear', authenticate, requireAdmin, [
  body('patterns')
    .isArray({ min: 1, max: 10 })
    .withMessage('模式数组不能为空，最多支持10个模式'),
  body('patterns.*')
    .isString()
    .withMessage('模式必须是字符串'),
], validateRequest, CacheController.batchClearCache);

/**
 * @route GET /api/v1/cache/keys
 * @desc 获取缓存键列表
 * @access Private (Admin)
 */
router.get('/keys', authenticate, requireAdmin, [
  query('pattern')
    .optional()
    .isString()
    .withMessage('模式必须是字符串'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('限制数量必须是1-1000之间的整数'),
], validateRequest, CacheController.getCacheKeys);

/**
 * @route GET /api/v1/cache/preview/:previewId
 * @desc 获取预览数据
 * @access Private
 */
router.get('/preview/:previewId', authenticate, [
  param('previewId')
    .isUUID()
    .withMessage('预览ID格式不正确'),
], validateRequest, CacheController.getPreviewData);

/**
 * @route DELETE /api/v1/cache/preview/:previewId
 * @desc 删除预览数据
 * @access Private
 */
router.delete('/preview/:previewId', authenticate, [
  param('previewId')
    .isUUID()
    .withMessage('预览ID格式不正确'),
], validateRequest, CacheController.deletePreviewData);

/**
 * @route POST /api/v1/cache/custom
 * @desc 设置自定义缓存
 * @access Private (Admin)
 */
router.post('/custom', authenticate, requireAdmin, [
  body('key')
    .notEmpty()
    .withMessage('缓存键不能为空')
    .isLength({ max: 200 })
    .withMessage('缓存键长度不能超过200个字符'),
  body('value')
    .exists()
    .withMessage('缓存值不能为空'),
  body('ttl')
    .optional()
    .isInt({ min: 1, max: 86400 })
    .withMessage('TTL必须是1-86400之间的整数'),
  body('prefix')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('前缀长度不能超过50个字符'),
], validateRequest, CacheController.setCustomCache);

/**
 * @route GET /api/v1/cache/custom/:key
 * @desc 获取自定义缓存
 * @access Private (Admin)
 */
router.get('/custom/:key', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('缓存键不能为空'),
  query('prefix')
    .optional()
    .isString()
    .withMessage('前缀必须是字符串'),
], validateRequest, CacheController.getCustomCache);

/**
 * @route DELETE /api/v1/cache/custom/:key
 * @desc 删除自定义缓存
 * @access Private (Admin)
 */
router.delete('/custom/:key', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('缓存键不能为空'),
  query('prefix')
    .optional()
    .isString()
    .withMessage('前缀必须是字符串'),
], validateRequest, CacheController.deleteCustomCache);

/**
 * @route POST /api/v1/cache/counter/:key/increment
 * @desc 增量计数器
 * @access Private (Admin)
 */
router.post('/counter/:key/increment', authenticate, requireAdmin, [
  param('key')
    .notEmpty()
    .withMessage('计数器键不能为空')
    .isLength({ max: 100 })
    .withMessage('计数器键长度不能超过100个字符'),
  body('ttl')
    .optional()
    .isInt({ min: 1, max: 86400 })
    .withMessage('TTL必须是1-86400之间的整数'),
  body('prefix')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('前缀长度不能超过50个字符'),
], validateRequest, CacheController.incrementCounter);

export default router;