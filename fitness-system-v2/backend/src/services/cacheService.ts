import redisService from '../config/redis';
import logger from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // 过期时间（秒）
  prefix?: string; // 键前缀
  compress?: boolean; // 是否压缩
}

export interface PreviewData {
  id: string;
  type: 'excel' | 'analysis' | 'export';
  data: any;
  metadata: {
    userId: number;
    fileName?: string;
    fileSize?: number;
    processedAt: Date;
    expiresAt: Date;
  };
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface CacheStats {
  totalKeys: number;
  usedMemory: string;
  connectedClients: number;
  uptime: number;
  hitRate: number;
}

class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1小时
  private readonly PREVIEW_TTL = 1800; // 30分钟
  private readonly ANALYTICS_TTL = 300; // 5分钟
  private readonly STATS_TTL = 60; // 1分钟

  /**
   * 生成缓存键
   */
  private generateKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || 'fitness_system';
    return `${finalPrefix}:${key}`;
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const ttl = options.ttl || this.DEFAULT_TTL;
      
      let finalValue: string;
      
      if (typeof value === 'string') {
        finalValue = value;
      } else {
        finalValue = JSON.stringify(value);
      }

      // 如果需要压缩（对于大数据）
      if (options.compress && finalValue.length > 1024) {
        // 这里可以添加压缩逻辑，如gzip
        logger.info(`Compressing cache data for key: ${cacheKey}`);
      }

      const result = await redisService.set(cacheKey, finalValue, ttl);
      
      if (result) {
        logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const value = await redisService.get(cacheKey);
      
      if (!value) {
        logger.debug(`Cache miss: ${cacheKey}`);
        return null;
      }

      logger.debug(`Cache hit: ${cacheKey}`);
      
      try {
        return JSON.parse(value) as T;
      } catch {
        // 如果不是JSON，直接返回字符串
        return value as unknown as T;
      }
    } catch (error) {
      logger.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await redisService.del(cacheKey);
      
      if (result) {
        logger.debug(`Cache deleted: ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error deleting cache:', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      return await redisService.exists(cacheKey);
    } catch (error) {
      logger.error('Error checking cache existence:', error);
      return false;
    }
  }

  /**
   * 设置预览数据
   */
  async setPreviewData(previewData: PreviewData): Promise<boolean> {
    try {
      const key = `preview:${previewData.id}`;
      return await this.set(key, previewData, {
        ttl: this.PREVIEW_TTL,
        prefix: 'preview'
      });
    } catch (error) {
      logger.error('Error setting preview data:', error);
      return false;
    }
  }

  /**
   * 获取预览数据
   */
  async getPreviewData(previewId: string): Promise<PreviewData | null> {
    try {
      const key = `preview:${previewId}`;
      return await this.get<PreviewData>(key, { prefix: 'preview' });
    } catch (error) {
      logger.error('Error getting preview data:', error);
      return null;
    }
  }

  /**
   * 删除预览数据
   */
  async deletePreviewData(previewId: string): Promise<boolean> {
    try {
      const key = `preview:${previewId}`;
      return await this.delete(key, { prefix: 'preview' });
    } catch (error) {
      logger.error('Error deleting preview data:', error);
      return false;
    }
  }

  /**
   * 设置分析数据缓存
   */
  async setAnalyticsCache(type: string, identifier: string, data: any): Promise<boolean> {
    try {
      const key = `analytics:${type}:${identifier}`;
      return await this.set(key, data, {
        ttl: this.ANALYTICS_TTL,
        prefix: 'analytics'
      });
    } catch (error) {
      logger.error('Error setting analytics cache:', error);
      return false;
    }
  }

  /**
   * 获取分析数据缓存
   */
  async getAnalyticsCache<T = any>(type: string, identifier: string): Promise<T | null> {
    try {
      const key = `analytics:${type}:${identifier}`;
      return await this.get<T>(key, { prefix: 'analytics' });
    } catch (error) {
      logger.error('Error getting analytics cache:', error);
      return null;
    }
  }

  /**
   * 缓存统计数据
   */
  async setStatsCache(type: string, data: any): Promise<boolean> {
    try {
      const key = `stats:${type}`;
      return await this.set(key, data, {
        ttl: this.STATS_TTL,
        prefix: 'stats'
      });
    } catch (error) {
      logger.error('Error setting stats cache:', error);
      return false;
    }
  }

  /**
   * 获取统计数据缓存
   */
  async getStatsCache<T = any>(type: string): Promise<T | null> {
    try {
      const key = `stats:${type}`;
      return await this.get<T>(key, { prefix: 'stats' });
    } catch (error) {
      logger.error('Error getting stats cache:', error);
      return null;
    }
  }

  /**
   * 批量删除缓存（根据模式）
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const client = redisService.getClient();
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await client.del(keys);
      logger.info(`Deleted ${keys.length} cache keys with pattern: ${pattern}`);
      
      return keys.length;
    } catch (error) {
      logger.error('Error deleting cache by pattern:', error);
      return 0;
    }
  }

  /**
   * 清理过期的预览数据
   */
  async cleanupExpiredPreviews(): Promise<number> {
    try {
      const pattern = this.generateKey('preview:*', 'preview');
      return await this.deleteByPattern(pattern);
    } catch (error) {
      logger.error('Error cleaning up expired previews:', error);
      return 0;
    }
  }

  /**
   * 清理分析缓存
   */
  async clearAnalyticsCache(): Promise<number> {
    try {
      const pattern = this.generateKey('analytics:*', 'analytics');
      return await this.deleteByPattern(pattern);
    } catch (error) {
      logger.error('Error clearing analytics cache:', error);
      return 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<CacheStats | null> {
    try {
      const client = redisService.getClient();
      const info = await client.info();
      
      // 解析Redis INFO命令的输出
      const lines = info.split('\r\n');
      const stats: any = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      }

      // 获取所有键的数量
      const allKeys = await client.keys('fitness_system:*');
      
      return {
        totalKeys: allKeys.length,
        usedMemory: stats.used_memory_human || '0B',
        connectedClients: parseInt(stats.connected_clients || '0'),
        uptime: parseInt(stats.uptime_in_seconds || '0'),
        hitRate: 0 // 这个需要通过应用层统计
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * 增量计数器
   */
  async incrementCounter(key: string, options: CacheOptions = {}): Promise<number | null> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await redisService.incr(cacheKey);
      
      // 设置过期时间
      if (result === 1 && options.ttl) {
        await redisService.expire(cacheKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      logger.error('Error incrementing counter:', error);
      return null;
    }
  }

  /**
   * 设置会话缓存
   */
  async setSessionCache(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      return await this.set(key, data, {
        ttl,
        prefix: 'session'
      });
    } catch (error) {
      logger.error('Error setting session cache:', error);
      return false;
    }
  }

  /**
   * 获取会话缓存
   */
  async getSessionCache<T = any>(sessionId: string): Promise<T | null> {
    try {
      const key = `session:${sessionId}`;
      return await this.get<T>(key, { prefix: 'session' });
    } catch (error) {
      logger.error('Error getting session cache:', error);
      return null;
    }
  }

  /**
   * 删除会话缓存
   */
  async deleteSessionCache(sessionId: string): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      return await this.delete(key, { prefix: 'session' });
    } catch (error) {
      logger.error('Error deleting session cache:', error);
      return false;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health_check';
      const testValue = 'ok';
      
      // 设置测试值
      const setResult = await redisService.set(testKey, testValue, 10);
      if (!setResult) return false;
      
      // 获取测试值
      const getValue = await redisService.get(testKey);
      if (getValue !== testValue) return false;
      
      // 删除测试值
      await redisService.del(testKey);
      
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }
}

export default new CacheService();