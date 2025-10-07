import EvaluationStandard from '../models/EvaluationStandard';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import { validateEvaluationStandardData } from '../utils/validation';

export interface EvaluationStandardCreateData {
  name: string;
  description?: string;
  year: number;
  grade_min: number;
  grade_max: number;
  gender: '0' | '1';
  sport_item: string;
  excellent_min?: number;
  good_min?: number;
  pass_min?: number;
  fail_max?: number;
  is_time_based: boolean;
  unit: string;
  is_active: boolean;
}

export interface EvaluationStandardUpdateData extends Partial<EvaluationStandardCreateData> {
  id: number;
}

export interface EvaluationStandardQueryParams {
  year?: number;
  grade?: number;
  gender?: '0' | '1';
  sport_item?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

class EvaluationStandardService {
  /**
   * 创建评分标准
   */
  static async createStandard(data: EvaluationStandardCreateData): Promise<EvaluationStandard> {
    try {
      // 验证数据
      const validation = validateEvaluationStandardData(data);
      if (!validation.isValid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 检查是否已存在相同条件的标准
      const existing = await EvaluationStandard.findOne({
        where: {
          year: data.year,
          grade_min: data.grade_min,
          grade_max: data.grade_max,
          gender: data.gender,
          sport_item: data.sport_item,
          is_active: true
        }
      });

      if (existing) {
        throw new Error('已存在相同条件的评分标准');
      }

      const standard = await EvaluationStandard.create(data);
      logger.info(`Created evaluation standard: ${standard.id}`);
      
      return standard;
    } catch (error) {
      logger.error('Error creating evaluation standard:', error);
      throw error;
    }
  }

  /**
   * 获取评分标准列表
   */
  static async getStandards(params: EvaluationStandardQueryParams) {
    try {
      const {
        year,
        grade,
        gender,
        sport_item,
        is_active = true,
        page = 1,
        limit = 20
      } = params;

      const where: any = {};

      if (year !== undefined) where.year = year;
      if (gender !== undefined) where.gender = gender;
      if (sport_item) where.sport_item = sport_item;
      if (is_active !== undefined) where.is_active = is_active;

      // 年级范围查询
      if (grade !== undefined) {
        where[Op.and] = [
          { grade_min: { [Op.lte]: grade } },
          { grade_max: { [Op.gte]: grade } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await EvaluationStandard.findAndCountAll({
        where,
        limit,
        offset,
        order: [['year', 'DESC'], ['sport_item', 'ASC'], ['gender', 'ASC']],
      });

      return {
        standards: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting evaluation standards:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取评分标准
   */
  static async getStandardById(id: number): Promise<EvaluationStandard | null> {
    try {
      const standard = await EvaluationStandard.findByPk(id);
      return standard;
    } catch (error) {
      logger.error('Error getting evaluation standard by id:', error);
      throw error;
    }
  }

  /**
   * 更新评分标准
   */
  static async updateStandard(data: EvaluationStandardUpdateData): Promise<EvaluationStandard> {
    try {
      const { id, ...updateData } = data;

      const standard = await EvaluationStandard.findByPk(id);
      if (!standard) {
        throw new Error('评分标准不存在');
      }

      // 验证更新数据
      if (Object.keys(updateData).length > 0) {
        const validation = validateEvaluationStandardData(updateData, true);
        if (!validation.isValid) {
          throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
        }
      }

      await standard.update(updateData);
      logger.info(`Updated evaluation standard: ${id}`);
      
      return standard;
    } catch (error) {
      logger.error('Error updating evaluation standard:', error);
      throw error;
    }
  }

  /**
   * 删除评分标准（软删除）
   */
  static async deleteStandard(id: number): Promise<boolean> {
    try {
      const standard = await EvaluationStandard.findByPk(id);
      if (!standard) {
        throw new Error('评分标准不存在');
      }

      await standard.destroy();
      logger.info(`Deleted evaluation standard: ${id}`);
      
      return true;
    } catch (error) {
      logger.error('Error deleting evaluation standard:', error);
      throw error;
    }
  }

  /**
   * 获取适用的评分标准
   */
  static async getApplicableStandard(
    year: number,
    grade: number,
    gender: '0' | '1',
    sport_item: string
  ): Promise<EvaluationStandard | null> {
    try {
      const standard = await EvaluationStandard.findOne({
        where: {
          year,
          grade_min: { [Op.lte]: grade },
          grade_max: { [Op.gte]: grade },
          gender,
          sport_item,
          is_active: true
        },
        order: [['created_at', 'DESC']] // 如果有多个，取最新的
      });

      return standard;
    } catch (error) {
      logger.error('Error getting applicable standard:', error);
      throw error;
    }
  }

  /**
   * 批量创建评分标准
   */
  static async batchCreateStandards(dataList: EvaluationStandardCreateData[]): Promise<EvaluationStandard[]> {
    try {
      // 验证所有数据
      for (const data of dataList) {
        const validation = validateEvaluationStandardData(data);
        if (!validation.isValid) {
          throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
        }
      }

      const standards = await EvaluationStandard.bulkCreate(dataList);
      logger.info(`Batch created ${standards.length} evaluation standards`);
      
      return standards;
    } catch (error) {
      logger.error('Error batch creating evaluation standards:', error);
      throw error;
    }
  }

  /**
   * 获取支持的体测项目列表
   */
  static async getSportItems(): Promise<string[]> {
    try {
      const result = await EvaluationStandard.findAll({
        attributes: ['sport_item'],
        group: ['sport_item'],
        where: { is_active: true },
        order: [['sport_item', 'ASC']]
      });

      return result.map(item => item.sport_item);
    } catch (error) {
      logger.error('Error getting sport items:', error);
      throw error;
    }
  }

  /**
   * 计算学生体测成绩等级和分数
   */
  static async calculateGradeAndScore(
    year: number,
    grade: number,
    gender: '0' | '1',
    sport_item: string,
    value: number
  ): Promise<{ grade: string; score: number } | null> {
    try {
      const standard = await this.getApplicableStandard(year, grade, gender, sport_item);
      
      if (!standard) {
        logger.warn(`No applicable standard found for: ${year}, ${grade}, ${gender}, ${sport_item}`);
        return null;
      }

      const gradeResult = standard.calculateGrade(value);
      const score = standard.calculateScore(value);

      return {
        grade: gradeResult,
        score
      };
    } catch (error) {
      logger.error('Error calculating grade and score:', error);
      throw error;
    }
  }
}

export default EvaluationStandardService;