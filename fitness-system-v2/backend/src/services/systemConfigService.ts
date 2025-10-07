import SystemConfig from '../models/SystemConfig';
import logger from '../utils/logger';
import cacheService from './cacheService';

export interface ConfigCreateData {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  category: string;
  name: string;
  description?: string;
  is_public?: boolean;
  is_readonly?: boolean;
  default_value?: any;
  validation_rule?: any;
}

export interface ConfigUpdateData {
  value?: any;
  name?: string;
  description?: string;
  is_public?: boolean;
  is_readonly?: boolean;
  validation_rule?: any;
}

export interface ConfigQueryParams {
  category?: string;
  is_public?: boolean;
  page?: number;
  limit?: number;
}

class SystemConfigService {
  private static readonly CACHE_PREFIX = 'system_config';
  private static readonly CACHE_TTL = 3600; // 1小时

  /**
   * 创建系统配置
   */
  static async createConfig(data: ConfigCreateData): Promise<SystemConfig> {
    try {
      // 检查键是否已存在
      const existing = await SystemConfig.findOne({
        where: { key: data.key }
      });

      if (existing) {
        throw new Error('配置键已存在');
      }

      const config = new SystemConfig();
      config.key = data.key;
      config.type = data.type;
      config.category = data.category;
      config.name = data.name;
      config.description = data.description;
      config.is_public = data.is_public || false;
      config.is_readonly = data.is_readonly || false;
      config.default_value = data.default_value ? JSON.stringify(data.default_value) : undefined;
      config.validation_rule = data.validation_rule ? JSON.stringify(data.validation_rule) : undefined;

      // 设置值
      config.setParsedValue(data.value);

      // 验证值
      const validation = config.validateValue(data.value);
      if (!validation.isValid) {
        throw new Error(`值验证失败: ${validation.error}`);
      }

      await config.save();

      // 更新缓存
      await this.updateConfigCache(config.key, config.getParsedValue());

      logger.info(`Created system config: ${config.key}`);
      return config;
    } catch (error) {
      logger.error('Error creating system config:', error);
      throw error;
    }
  }

  /**
   * 获取配置列表
   */
  static async getConfigs(params: ConfigQueryParams = {}) {
    try {
      const {
        category,
        is_public,
        page = 1,
        limit = 50
      } = params;

      const where: any = {};
      if (category) where.category = category;
      if (is_public !== undefined) where.is_public = is_public;

      const offset = (page - 1) * limit;

      const { count, rows } = await SystemConfig.findAndCountAll({
        where,
        limit,
        offset,
        order: [['category', 'ASC'], ['name', 'ASC']],
      });

      // 解析值
      const configs = rows.map(config => ({
        ...config.toJSON(),
        parsed_value: config.getParsedValue()
      }));

      return {
        configs,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting system configs:', error);
      throw error;
    }
  }

  /**
   * 根据键获取配置
   */
  static async getConfigByKey(key: string): Promise<SystemConfig | null> {
    try {
      // 先尝试从缓存获取
      const cachedValue = await cacheService.get(
        `config:${key}`, 
        { prefix: this.CACHE_PREFIX }
      );

      if (cachedValue !== null) {
        // 如果需要完整的配置对象，从数据库获取
        const config = await SystemConfig.findOne({ where: { key } });
        if (config) {
          // 设置缓存的值
          config.value = typeof cachedValue === 'string' ? cachedValue : JSON.stringify(cachedValue);
        }
        return config;
      }

      // 从数据库获取
      const config = await SystemConfig.findOne({ where: { key } });
      
      if (config) {
        // 更新缓存
        await this.updateConfigCache(key, config.getParsedValue());
      }

      return config;
    } catch (error) {
      logger.error('Error getting system config by key:', error);
      throw error;
    }
  }

  /**
   * 更新配置
   */
  static async updateConfig(key: string, data: ConfigUpdateData): Promise<SystemConfig> {
    try {
      const config = await SystemConfig.findOne({ where: { key } });
      
      if (!config) {
        throw new Error('配置不存在');
      }

      if (config.is_readonly) {
        throw new Error('只读配置不能修改');
      }

      // 更新字段
      if (data.name !== undefined) config.name = data.name;
      if (data.description !== undefined) config.description = data.description;
      if (data.is_public !== undefined) config.is_public = data.is_public;
      if (data.is_readonly !== undefined) config.is_readonly = data.is_readonly;
      if (data.validation_rule !== undefined) {
        config.validation_rule = JSON.stringify(data.validation_rule);
      }

      // 更新值
      if (data.value !== undefined) {
        // 验证值
        const validation = config.validateValue(data.value);
        if (!validation.isValid) {
          throw new Error(`值验证失败: ${validation.error}`);
        }

        config.setParsedValue(data.value);
        
        // 更新缓存
        await this.updateConfigCache(key, config.getParsedValue());
      }

      await config.save();

      logger.info(`Updated system config: ${key}`);
      return config;
    } catch (error) {
      logger.error('Error updating system config:', error);
      throw error;
    }
  }

  /**
   * 删除配置
   */
  static async deleteConfig(key: string): Promise<boolean> {
    try {
      const config = await SystemConfig.findOne({ where: { key } });
      
      if (!config) {
        throw new Error('配置不存在');
      }

      if (config.is_readonly) {
        throw new Error('只读配置不能删除');
      }

      await config.destroy();

      // 清除缓存
      await cacheService.delete(`config:${key}`, { prefix: this.CACHE_PREFIX });

      logger.info(`Deleted system config: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error deleting system config:', error);
      throw error;
    }
  }

  /**
   * 获取配置值（仅值）
   */
  static async getValue(key: string, defaultValue?: any): Promise<any> {
    try {
      const config = await this.getConfigByKey(key);
      
      if (!config) {
        return defaultValue;
      }

      return config.getParsedValue();
    } catch (error) {
      logger.error('Error getting config value:', error);
      return defaultValue;
    }
  }

  /**
   * 设置配置值
   */
  static async setValue(key: string, value: any): Promise<boolean> {
    try {
      const config = await SystemConfig.findOne({ where: { key } });
      
      if (!config) {
        throw new Error('配置不存在');
      }

      if (config.is_readonly) {
        throw new Error('只读配置不能修改');
      }

      // 验证值
      const validation = config.validateValue(value);
      if (!validation.isValid) {
        throw new Error(`值验证失败: ${validation.error}`);
      }

      config.setParsedValue(value);
      await config.save();

      // 更新缓存
      await this.updateConfigCache(key, config.getParsedValue());

      logger.info(`Set config value: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error setting config value:', error);
      throw error;
    }
  }

  /**
   * 批量获取配置
   */
  static async getMultipleConfigs(keys: string[]): Promise<Record<string, any>> {
    try {
      const result: Record<string, any> = {};

      for (const key of keys) {
        const config = await this.getConfigByKey(key);
        if (config) {
          result[key] = config.getParsedValue();
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting multiple configs:', error);
      throw error;
    }
  }

  /**
   * 获取公开配置（前端可访问）
   */
  static async getPublicConfigs(): Promise<Record<string, any>> {
    try {
      // 尝试从缓存获取
      const cached = await cacheService.get(
        'public_configs',
        { prefix: this.CACHE_PREFIX }
      );

      if (cached) {
        return cached;
      }

      // 从数据库获取
      const configs = await SystemConfig.findAll({
        where: { is_public: true },
        attributes: ['key', 'value', 'type']
      });

      const result: Record<string, any> = {};
      configs.forEach(config => {
        result[config.key] = config.getParsedValue();
      });

      // 缓存结果
      await cacheService.set(
        'public_configs',
        result,
        { prefix: this.CACHE_PREFIX, ttl: this.CACHE_TTL }
      );

      return result;
    } catch (error) {
      logger.error('Error getting public configs:', error);
      throw error;
    }
  }

  /**
   * 按分类获取配置
   */
  static async getConfigsByCategory(category: string): Promise<Record<string, any>> {
    try {
      const configs = await SystemConfig.findAll({
        where: { category },
        attributes: ['key', 'value', 'type']
      });

      const result: Record<string, any> = {};
      configs.forEach(config => {
        result[config.key] = config.getParsedValue();
      });

      return result;
    } catch (error) {
      logger.error('Error getting configs by category:', error);
      throw error;
    }
  }

  /**
   * 重置配置到默认值
   */
  static async resetToDefault(key: string): Promise<boolean> {
    try {
      const config = await SystemConfig.findOne({ where: { key } });
      
      if (!config) {
        throw new Error('配置不存在');
      }

      if (config.is_readonly) {
        throw new Error('只读配置不能重置');
      }

      if (!config.default_value) {
        throw new Error('配置没有默认值');
      }

      const defaultValue = JSON.parse(config.default_value);
      config.setParsedValue(defaultValue);
      await config.save();

      // 更新缓存
      await this.updateConfigCache(key, config.getParsedValue());

      logger.info(`Reset config to default: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error resetting config to default:', error);
      throw error;
    }
  }

  /**
   * 获取配置分类列表
   */
  static async getCategories(): Promise<string[]> {
    try {
      const configs = await SystemConfig.findAll({
        attributes: ['category'],
        group: ['category'],
        order: [['category', 'ASC']]
      });

      return configs.map(config => config.category);
    } catch (error) {
      logger.error('Error getting config categories:', error);
      throw error;
    }
  }

  /**
   * 更新配置缓存
   */
  private static async updateConfigCache(key: string, value: any): Promise<void> {
    try {
      await cacheService.set(
        `config:${key}`,
        value,
        { prefix: this.CACHE_PREFIX, ttl: this.CACHE_TTL }
      );

      // 清除公开配置缓存，强制重新生成
      await cacheService.delete(
        'public_configs',
        { prefix: this.CACHE_PREFIX }
      );
    } catch (error) {
      logger.error('Error updating config cache:', error);
    }
  }

  /**
   * 清除所有配置缓存
   */
  static async clearConfigCache(): Promise<void> {
    try {
      await cacheService.deleteByPattern(`${this.CACHE_PREFIX}:*`);
      logger.info('Cleared all config cache');
    } catch (error) {
      logger.error('Error clearing config cache:', error);
    }
  }

  /**
   * 初始化默认配置
   */
  static async initializeDefaultConfigs(): Promise<void> {
    try {
      const defaultConfigs = [
        {
          key: 'system.name',
          value: '学生体测管理系统',
          type: 'string' as const,
          category: 'system',
          name: '系统名称',
          description: '系统显示名称',
          is_public: true
        },
        {
          key: 'system.version',
          value: '1.0.0',
          type: 'string' as const,
          category: 'system',
          name: '系统版本',
          description: '当前系统版本号',
          is_public: true,
          is_readonly: true
        },
        {
          key: 'upload.max_file_size',
          value: 10485760, // 10MB
          type: 'number' as const,
          category: 'upload',
          name: '最大文件大小',
          description: '上传文件的最大大小（字节）',
          validation_rule: { min: 1024, max: 104857600 }
        },
        {
          key: 'upload.allowed_types',
          value: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
          type: 'json' as const,
          category: 'upload',
          name: '允许的文件类型',
          description: '允许上传的文件MIME类型'
        },
        {
          key: 'data.current_year',
          value: new Date().getFullYear(),
          type: 'number' as const,
          category: 'data',
          name: '当前学年',
          description: '系统当前使用的学年',
          is_public: true
        },
        {
          key: 'security.session_timeout',
          value: 86400, // 24小时
          type: 'number' as const,
          category: 'security',
          name: '会话超时时间',
          description: '用户会话超时时间（秒）',
          validation_rule: { min: 300, max: 604800 }
        },
        {
          key: 'cache.default_ttl',
          value: 3600, // 1小时
          type: 'number' as const,
          category: 'cache',
          name: '默认缓存时间',
          description: '默认缓存过期时间（秒）',
          validation_rule: { min: 60, max: 86400 }
        }
      ];

      for (const configData of defaultConfigs) {
        const existing = await SystemConfig.findOne({
          where: { key: configData.key }
        });

        if (!existing) {
          await this.createConfig(configData);
        }
      }

      logger.info('Default configs initialized');
    } catch (error) {
      logger.error('Error initializing default configs:', error);
    }
  }
}

export default SystemConfigService;