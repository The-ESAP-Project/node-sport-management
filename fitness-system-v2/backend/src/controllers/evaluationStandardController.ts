import { Request, Response } from 'express';
import EvaluationStandardService from '../services/evaluationStandardService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

class EvaluationStandardController {
  /**
   * 创建评分标准
   */
  static async createStandard(req: Request, res: Response): Promise<void> {
    try {
      const standard = await EvaluationStandardService.createStandard(req.body);
      
      res.status(201).json(ResponseUtils.success(standard, '评分标准创建成功'));
    } catch (error: any) {
      logger.error('Error in createStandard:', error);
      res.status(400).json(ResponseUtils.error('CREATE_FAILED', error.message));
    }
  }

  /**
   * 获取评分标准列表
   */
  static async getStandards(req: Request, res: Response): Promise<void> {
    try {
      const {
        year,
        grade,
        gender,
        sport_item,
        is_active,
        page,
        limit
      } = req.query;

      const params = {
        year: year ? parseInt(year as string) : undefined,
        grade: grade ? parseInt(grade as string) : undefined,
        gender: gender as '0' | '1' | undefined,
        sport_item: sport_item as string | undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await EvaluationStandardService.getStandards(params);
      
      res.json(ResponseUtils.success(result, '获取评分标准列表成功'));
    } catch (error: any) {
      logger.error('Error in getStandards:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 根据ID获取评分标准
   */
  static async getStandardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const standard = await EvaluationStandardService.getStandardById(parseInt(id));
      
      if (!standard) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', '评分标准不存在'));
        return;
      }
      
      res.json(ResponseUtils.success(standard, '获取评分标准成功'));
    } catch (error: any) {
      logger.error('Error in getStandardById:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 更新评分标准
   */
  static async updateStandard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = {
        id: parseInt(id),
        ...req.body
      };

      const standard = await EvaluationStandardService.updateStandard(updateData);
      
      res.json(ResponseUtils.success(standard, '评分标准更新成功'));
    } catch (error: any) {
      logger.error('Error in updateStandard:', error);
      
      if (error.message === '评分标准不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else {
        res.status(400).json(ResponseUtils.error('UPDATE_FAILED', error.message));
      }
    }
  }

  /**
   * 删除评分标准
   */
  static async deleteStandard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EvaluationStandardService.deleteStandard(parseInt(id));
      
      res.json(ResponseUtils.success(null, '评分标准删除成功'));
    } catch (error: any) {
      logger.error('Error in deleteStandard:', error);
      
      if (error.message === '评分标准不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else {
        res.status(500).json(ResponseUtils.error('DELETE_FAILED', error.message));
      }
    }
  }

  /**
   * 批量创建评分标准
   */
  static async batchCreateStandards(req: Request, res: Response): Promise<void> {
    try {
      const { standards } = req.body;
      
      if (!Array.isArray(standards) || standards.length === 0) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供有效的评分标准数组'));
        return;
      }

      const result = await EvaluationStandardService.batchCreateStandards(standards);
      
      res.status(201).json(ResponseUtils.success(result, `成功创建${result.length}个评分标准`));
    } catch (error: any) {
      logger.error('Error in batchCreateStandards:', error);
      res.status(400).json(ResponseUtils.error('BATCH_CREATE_FAILED', error.message));
    }
  }

  /**
   * 获取支持的体测项目列表
   */
  static async getSportItems(req: Request, res: Response): Promise<void> {
    try {
      const sportItems = await EvaluationStandardService.getSportItems();
      
      res.json(ResponseUtils.success(sportItems, '获取体测项目列表成功'));
    } catch (error: any) {
      logger.error('Error in getSportItems:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 计算体测成绩等级和分数
   */
  static async calculateGradeAndScore(req: Request, res: Response): Promise<void> {
    try {
      const { year, grade, gender, sport_item, value } = req.body;
      
      if (!year || !grade || !gender || !sport_item || value === undefined) {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供完整的计算参数'));
        return;
      }

      const result = await EvaluationStandardService.calculateGradeAndScore(
        parseInt(year),
        parseInt(grade),
        gender,
        sport_item,
        parseFloat(value)
      );
      
      if (!result) {
        res.status(404).json(ResponseUtils.error('NO_STANDARD', '未找到适用的评分标准'));
        return;
      }
      
      res.json(ResponseUtils.success(result, '计算成功'));
    } catch (error: any) {
      logger.error('Error in calculateGradeAndScore:', error);
      res.status(500).json(ResponseUtils.error('CALCULATE_FAILED', error.message));
    }
  }

  /**
   * 获取适用的评分标准
   */
  static async getApplicableStandard(req: Request, res: Response): Promise<void> {
    try {
      const { year, grade, gender, sport_item } = req.query;
      
      if (!year || !grade || !gender || !sport_item) {
        res.status(400).json(ResponseUtils.error('INVALID_PARAMS', '请提供完整的查询参数'));
        return;
      }

      const standard = await EvaluationStandardService.getApplicableStandard(
        parseInt(year as string),
        parseInt(grade as string),
        gender as '0' | '1',
        sport_item as string
      );
      
      if (!standard) {
        res.status(404).json(ResponseUtils.error('NO_STANDARD', '未找到适用的评分标准'));
        return;
      }
      
      res.json(ResponseUtils.success(standard, '获取适用标准成功'));
    } catch (error: any) {
      logger.error('Error in getApplicableStandard:', error);
      res.status(500).json(ResponseUtils.error('FETCH_FAILED', error.message));
    }
  }

  /**
   * 启用/禁用评分标准
   */
  static async toggleStandardStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      if (typeof is_active !== 'boolean') {
        res.status(400).json(ResponseUtils.error('INVALID_DATA', '请提供有效的状态值'));
        return;
      }

      const standard = await EvaluationStandardService.updateStandard({
        id: parseInt(id),
        is_active
      });
      
      res.json(ResponseUtils.success(standard, `评分标准已${is_active ? '启用' : '禁用'}`));
    } catch (error: any) {
      logger.error('Error in toggleStandardStatus:', error);
      
      if (error.message === '评分标准不存在') {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', error.message));
      } else {
        res.status(500).json(ResponseUtils.error('UPDATE_FAILED', error.message));
      }
    }
  }
}

export default EvaluationStandardController;