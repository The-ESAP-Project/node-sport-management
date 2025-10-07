import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * 请求验证中间件工厂
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // 验证请求体
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // 验证查询参数
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // 验证路径参数
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed', {
        errors,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALID_001',
          message: `参数验证失败: ${errors.join('; ')}`
        }
      } as ApiResponse);
    }

    next();
  };
};

/**
 * 常用验证模式
 */
export const validationSchemas = {
  // 分页参数
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // ID参数
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // 用户登录
  login: Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    password: Joi.string().min(6).max(128).required()
  }),

  // 用户创建
  createUser: Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('admin', 'class').required(),
    className: Joi.string().trim().max(50).optional(),
    grade: Joi.string().trim().max(20).optional()
  }),

  // 密码更新
  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
  }),

  // 学生数据
  studentData: Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
    gender: Joi.string().valid('male', 'female').required(),
    className: Joi.string().trim().min(1).max(50).required(),
    height: Joi.number().positive().min(100).max(250).required(),
    weight: Joi.number().positive().min(20).max(200).required(),
    vitalCapacity: Joi.number().positive().min(500).max(8000).required(),
    run50m: Joi.number().positive().min(5).max(20).required(),
    longJump: Joi.number().positive().min(1).max(4).required(),
    sitAndReach: Joi.number().min(-20).max(50).required(),
    longRun: Joi.number().positive().min(100).max(1000).required(),
    strengthTest: Joi.number().integer().min(0).max(100).required()
  }),

  // 评分标准
  createStandard: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    year: Joi.number().integer().min(2020).max(2030).required(),
    version: Joi.string().trim().max(20).default('1.0'),
    items: Joi.array().items(
      Joi.object({
        item: Joi.string().valid(
          'height', 'weight', 'vital_capacity', 'run_50m',
          'long_jump', 'sit_and_reach', 'run_800m', 'run_1000m',
          'sit_up', 'pull_up'
        ).required(),
        gender: Joi.string().valid('male', 'female').required(),
        unit: Joi.string().trim().max(20).required(),
        weight: Joi.number().positive().max(1).required(),
        direction: Joi.string().valid('higher_better', 'lower_better').required(),
        ranges: Joi.array().items(
          Joi.object({
            min: Joi.number().allow(null),
            max: Joi.number().allow(null),
            score: Joi.number().integer().min(0).max(100).required()
          })
        ).min(1).required()
      })
    ).min(1).required()
  }),

  // 查询参数
  queryParams: {
    className: Joi.object({
      className: Joi.string().trim().max(50).optional(),
      grade: Joi.string().trim().max(20).optional(),
      year: Joi.number().integer().min(2020).max(2030).optional(),
      gender: Joi.string().valid('male', 'female').optional()
    }),

    analysis: Joi.object({
      scope: Joi.string().valid('class', 'grade', 'school').required(),
      target: Joi.string().trim().max(50).optional(),
      year: Joi.number().integer().min(2020).max(2030).optional(),
      years: Joi.string().pattern(/^\d{4}(,\d{4})*$/).optional()
    })
  }
};

export default validate;