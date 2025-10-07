import { Request, Response } from 'express';
import SystemConfigService from '../services/systemConfigService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

class SystemConfigController {
  /**
   * 创建系统配置
   */
  static async createConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await SystemConfigService.createConfig(req.body);
      
      res.status(201).json(ResponseUtils.success(config, '系统配置创建成功'));
    } catch (error: any) {
      logger.error('Error in createConfig:', error);
      
      if (error.message === '配置键已存在') {
        res.status(409).json(ResponseUtils.error('KEY_EXISTS', error.message));
      } else if (error.message.includes('值验证失败')) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', error.message));
      } else {
        res.status(400).json(ResponseUtils.error('CREATE_FAILED', error.message));
      }
    }
  }

  /**
   * 获取系统配置列表
   */
  static async getConfigs(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        is_public,
        page,
        limit
      } = req.query;

      const params = {
        category: category as string | undefined,
        is_public: is_public !== undefined ? is_public === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await SystemConfigService.getConfigs(params);
      
      res.json(ResponseUtils.success(result, '获取系统配置列表成功'));
    } catch (error: any) {
      logger.error('Error in getConfigs:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 根据键获取配置
   */
  static async getConfigByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const config = await SystemConfigService.getConfigByKey(key);
      
      if (!config) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '配置不存在'));
        return;
      }
      
      const result = {
        ...config.toJSON(),
        parsed_value: config.getParsedValue()
      };
      
      res.json(ResponseUtils.success(result, '获取系统配置成功'));
    } catch (error: any) {
      logger.error('Error in getConfigByKey:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 更新系统配置
   */
  static async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const config = await SystemConfigService.updateConfig(key, req.body);
      
      const result = {
        ...config.toJSON(),
        parsed_value: config.getParsedValue()
      };
      
      res.json(ResponseUtils.success(result, '系统配置更新成功'));
    } catch (error: any) {
      logger.error('Error in updateConfig:', error);
      
      if (error.message === '配置不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else if (error.message === '只读配置不能修改') {
        res.status(403).json(ResponseUtils.error('READONLY', error.message));
      } else if (error.message.includes('值验证失败')) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', error.message));
      } else {
        res.status(400).json(ResponseUtils.error('UPDATE_FAILED', error.message));
      }
    }
  }

  /**
   * 删除系统配置
   */
  static async deleteConfig(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      await SystemConfigService.deleteConfig(key);
      
      res.json(ResponseUtils.success(null, '系统配置删除成功'));
    } catch (error: any) {
      logger.error('Error in deleteConfig:', error);
      
      if (error.message === '配置不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else if (error.message === '只读配置不能删除') {
        res.status(403).json(ResponseUtils.error('READONLY', error.message));
      } else {
        res.status(500).json(ResponseUtils.error('DELETE_FAILED', error.message));
      }
    }
  }

  /**
   * 获取配置值
   */
  static async getValue(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { defaultValue } = req.query;
      
      const value = await SystemConfigService.getValue(
        key, 
        defaultValue ? JSON.parse(defaultValue as string) : undefined
      );
      
      res.json(ResponseUtils.success({ key, value }, '获取配置值成功'));
    } catch (error: any) {
      logger.error('Error in getValue:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 设置配置值
   */
  static async setValue(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (value === undefined) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '配置值不能为空'));
        return;
      }

      await SystemConfigService.setValue(key, value);
      
      res.json(ResponseUtils.success({ key, value }, '设置配置值成功'));
    } catch (error: any) {
      logger.error('Error in setValue:', error);
      
      if (error.message === '配置不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else if (error.message === '只读配置不能修改') {
        res.status(403).json(ResponseUtils.error('READONLY', error.message));
      } else if (error.message.includes('值验证失败')) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', error.message));
      } else {
        res.status(400).json(ResponseUtils.error('SET_FAILED', error.message));
      }
    }
  }

  /**
   * 批量获取配置
   */
  static async getMultipleConfigs(req: Request, res: Response): Promise<void> {
    try {
      const { keys } = req.body;
      
      if (!Array.isArray(keys) || keys.length === 0) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供有效的配置键数组'));
        return;
      }

      const configs = await SystemConfigService.getMultipleConfigs(keys);
      
      res.json(ResponseUtils.success(configs, '批量获取配置成功'));
    } catch (error: any) {
      logger.error('Error in getMultipleConfigs:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 获取公开配置
   */
  static async getPublicConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = await SystemConfigService.getPublicConfigs();
      
      res.json(ResponseUtils.success(configs, '获取公开配置成功'));
    } catch (error: any) {
      logger.error('Error in getPublicConfigs:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 按分类获取配置
   */
  static async getConfigsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const configs = await SystemConfigService.getConfigsByCategory(category);
      
      res.json(ResponseUtils.success(configs, `获取${category}分类配置成功`));
    } catch (error: any) {
      logger.error('Error in getConfigsByCategory:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 重置配置到默认值
   */
  static async resetToDefault(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      await SystemConfigService.resetToDefault(key);
      
      res.json(ResponseUtils.success(null, '配置已重置为默认值'));
    } catch (error: any) {
      logger.error('Error in resetToDefault:', error);
      
      if (error.message === '配置不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else if (error.message === '只读配置不能重置') {
        res.status(403).json(ResponseUtils.error('READONLY', error.message));
      } else if (error.message === '配置没有默认值') {
        res.status(400).json(ResponseUtils.error('NO_DEFAULT', error.message));
      } else {
        res.status(500).json(ResponseUtils.error('RESET_FAILED', error.message));
      }
    }
  }

  /**
   * 获取配置分类列表
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await SystemConfigService.getCategories();
      
      res.json(ResponseUtils.success(categories, '获取配置分类成功'));
    } catch (error: any) {
      logger.error('Error in getCategories:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 清除配置缓存
   */
  static async clearConfigCache(req: Request, res: Response): Promise<void> {
    try {
      await SystemConfigService.clearConfigCache();
      
      res.json(ResponseUtils.success(null, '配置缓存清除成功'));
    } catch (error: any) {
      logger.error('Error in clearConfigCache:', error);
      res.status(500).json(ResponseUtils.error('CLEAR_CACHE_FAILED', error.message));
    }
  }

  /**
   * 初始化默认配置
   */
  static async initializeDefaults(req: Request, res: Response): Promise<void> {
    try {
      await SystemConfigService.initializeDefaultConfigs();
      
      res.json(ResponseUtils.success(null, '默认配置初始化成功'));
    } catch (error: any) {
      logger.error('Error in initializeDefaults:', error);
      res.status(500).json(ResponseUtils.error('INIT_FAILED', error.message));
    }
  }

  /**
   * 系统信息概览
   */
  static async getSystemOverview(req: Request, res: Response): Promise<void> {
    try {
      // 获取系统相关配置
      const systemConfigs = await SystemConfigService.getConfigsByCategory('system');
      
      // 获取其他重要配置
      const importantConfigs = await SystemConfigService.getMultipleConfigs([
        'data.current_year',
        'upload.max_file_size',
        'security.session_timeout'
      ]);

      const overview = {
        system: systemConfigs,
        important: importantConfigs,
        timestamp: new Date().toISOString()
      };
      
      res.json(ResponseUtils.success(overview, '获取系统概览成功'));
    } catch (error: any) {
      logger.error('Error in getSystemOverview:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }
}

export default SystemConfigController;