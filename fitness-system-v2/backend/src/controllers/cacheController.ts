import { Request, Response } from 'express';
import cacheService from '../services/cacheService';
import redisService from '../config/redis';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

class CacheController {
  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await cacheService.getCacheStats();
      
      if (!stats) {
        res.status(500).json(ResponseUtils.error('STATS_FAILED', '无法获取缓存统计'));
        return;
      }
      
      res.json(ResponseUtils.success(stats, '获取缓存统计成功'));
    } catch (error: any) {
      logger.error('Error in getCacheStats:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 清理所有缓存
   */
  static async clearAllCache(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.body;
      let deletedCount = 0;

      switch (type) {
        case 'analytics':
          deletedCount = await cacheService.clearAnalyticsCache();
          break;
        case 'previews':
          deletedCount = await cacheService.cleanupExpiredPreviews();
          break;
        case 'all':
          const analyticsCount = await cacheService.clearAnalyticsCache();
          const previewsCount = await cacheService.cleanupExpiredPreviews();
          deletedCount = analyticsCount + previewsCount;
          break;
        default:
          res.status(400).json(ResponseUtils.error('INVALID_TYPE', '无效的缓存类型'));
          return;
      }
      
      res.json(ResponseUtils.success(
        { deletedCount, type },
        `成功清理${deletedCount}个缓存项`
      ));
    } catch (error: any) {
      logger.error('Error in clearAllCache:', error);
      res.status(500).json(ResponseUtils.error('CLEAR_FAILED', error.message));
    }
  }

  /**
   * 获取预览数据
   */
  static async getPreviewData(req: Request, res: Response): Promise<void> {
    try {
      const { previewId } = req.params;
      
      const previewData = await cacheService.getPreviewData(previewId);
      
      if (!previewData) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '预览数据不存在或已过期'));
        return;
      }
      
      res.json(ResponseUtils.success(previewData, '获取预览数据成功'));
    } catch (error: any) {
      logger.error('Error in getPreviewData:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 删除预览数据
   */
  static async deletePreviewData(req: Request, res: Response): Promise<void> {
    try {
      const { previewId } = req.params;
      
      const result = await cacheService.deletePreviewData(previewId);
      
      if (!result) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '预览数据不存在'));
        return;
      }
      
      res.json(ResponseUtils.success(null, '预览数据删除成功'));
    } catch (error: any) {
      logger.error('Error in deletePreviewData:', error);
      res.status(500).json(ResponseUtils.error('DELETE_FAILED', error.message));
    }
  }

  /**
   * 设置自定义缓存
   */
  static async setCustomCache(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, ttl, prefix } = req.body;
      
      if (!key || value === undefined) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '缓存键和值不能为空'));
        return;
      }

      const result = await cacheService.set(key, value, { ttl, prefix });
      
      if (!result) {
        res.status(500).json(ResponseUtils.error('SET_FAILED', '设置缓存失败'));
        return;
      }
      
      res.json(ResponseUtils.success(
        { key, ttl: ttl || 3600 },
        '缓存设置成功'
      ));
    } catch (error: any) {
      logger.error('Error in setCustomCache:', error);
      res.status(500).json(ResponseUtils.error('SET_FAILED', error.message));
    }
  }

  /**
   * 获取自定义缓存
   */
  static async getCustomCache(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { prefix } = req.query;
      
      const value = await cacheService.get(key, { prefix: prefix as string });
      
      if (value === null) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '缓存不存在或已过期'));
        return;
      }
      
      res.json(ResponseUtils.success({ key, value }, '获取缓存成功'));
    } catch (error: any) {
      logger.error('Error in getCustomCache:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 删除自定义缓存
   */
  static async deleteCustomCache(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { prefix } = req.query;
      
      const result = await cacheService.delete(key, { prefix: prefix as string });
      
      if (!result) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '缓存不存在'));
        return;
      }
      
      res.json(ResponseUtils.success(null, '缓存删除成功'));
    } catch (error: any) {
      logger.error('Error in deleteCustomCache:', error);
      res.status(500).json(ResponseUtils.error('DELETE_FAILED', error.message));
    }
  }

  /**
   * 缓存健康检查
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await cacheService.healthCheck();
      
      if (!isHealthy) {
        res.status(503).json(ResponseUtils.error('UNHEALTHY', 'Redis缓存服务不可用'));
        return;
      }
      
      res.json(ResponseUtils.success(
        { status: 'healthy', timestamp: new Date().toISOString() },
        'Redis缓存服务正常'
      ));
    } catch (error: any) {
      logger.error('Error in cache healthCheck:', error);
      res.status(503).json(ResponseUtils.error('HEALTH_CHECK_FAILED', error.message));
    }
  }

  /**
   * 批量清理缓存
   */
  static async batchClearCache(req: Request, res: Response): Promise<void> {
    try {
      const { patterns } = req.body;
      
      if (!Array.isArray(patterns) || patterns.length === 0) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供有效的模式数组'));
        return;
      }

      let totalDeleted = 0;
      const results = [];

      for (const pattern of patterns) {
        const deletedCount = await cacheService.deleteByPattern(pattern);
        totalDeleted += deletedCount;
        results.push({ pattern, deletedCount });
      }
      
      res.json(ResponseUtils.success(
        { totalDeleted, results },
        `成功清理${totalDeleted}个缓存项`
      ));
    } catch (error: any) {
      logger.error('Error in batchClearCache:', error);
      res.status(500).json(ResponseUtils.error('BATCH_CLEAR_FAILED', error.message));
    }
  }

  /**
   * 获取缓存键列表
   */
  static async getCacheKeys(req: Request, res: Response): Promise<void> {
    try {
      const { pattern = '*', limit = 100 } = req.query;
      
      // 获取Redis客户端
      const client = redisService.getClient();
      const keys = await client.keys(pattern as string);
      
      // 限制返回数量，避免内存问题
      const limitedKeys = keys.slice(0, parseInt(limit as string));
      
      // 获取每个键的TTL信息
      const keysWithTTL = await Promise.all(
        limitedKeys.map(async (key) => {
          const ttl = await client.ttl(key);
          return { key, ttl };
        })
      );
      
      res.json(ResponseUtils.success(
        {
          total: keys.length,
          returned: limitedKeys.length,
          keys: keysWithTTL
        },
        '获取缓存键列表成功'
      ));
    } catch (error: any) {
      logger.error('Error in getCacheKeys:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 增量计数器
   */
  static async incrementCounter(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { ttl, prefix } = req.body;
      
      const result = await cacheService.incrementCounter(key, { ttl, prefix });
      
      if (result === null) {
        res.status(500).json(ResponseUtils.error('INCREMENT_FAILED', '计数器增加失败'));
        return;
      }
      
      res.json(ResponseUtils.success(
        { key, value: result },
        '计数器增加成功'
      ));
    } catch (error: any) {
      logger.error('Error in incrementCounter:', error);
      res.status(500).json(ResponseUtils.error('INCREMENT_FAILED', error.message));
    }
  }
}

export default CacheController;