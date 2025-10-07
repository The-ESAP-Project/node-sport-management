import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt';
import { UserRole } from '../types/enums';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * JWT认证中间件
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: '缺少认证令牌'
        }
      } as ApiResponse);
      return;
    }

    // 验证令牌
    const payload = JwtService.verifyToken(token);
    req.user = payload;

    logger.auth('User authenticated', {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      ip: req.ip
    });

    next();
  } catch (error: any) {
    let errorCode = 'AUTH_001';
    let errorMessage = '认证失败';

    if (error.message === 'Token expired') {
      errorCode = 'AUTH_003';
      errorMessage = '令牌已过期';
    } else if (error.message === 'Invalid token') {
      errorCode = 'AUTH_001';
      errorMessage = '无效的令牌';
    }

    logger.auth('Authentication failed', {
      error: error.message,
      ip: req.ip
    });

    res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    } as ApiResponse);
    return;
  }
};

/**
 * 角色授权中间件工厂
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: '请先登录'
        }
      } as ApiResponse);
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.auth('Authorization failed', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: '权限不足'
        }
      } as ApiResponse);
    }

    next();
  };
};

/**
 * 班级权限检查中间件
 * 确保班级账号只能访问本班级的数据
 */
export const checkClassAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: '请先登录'
      }
    } as ApiResponse);
  }

  // 管理员可以访问所有数据
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // 班级账号需要检查班级权限
  if (req.user.role === UserRole.CLASS) {
    const requestedClassName = req.params.className || req.query.className || req.body.className;
    
    if (requestedClassName && requestedClassName !== req.user.className) {
      logger.auth('Class access denied', {
        userId: req.user.userId,
        userClassName: req.user.className,
        requestedClassName: requestedClassName,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: '只能访问本班级数据'
        }
      } as ApiResponse);
    }
  }

  next();
};

/**
 * 可选认证中间件
 * 如果有令牌则验证，没有令牌则跳过
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = JwtService.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // 可选认证失败时不返回错误，只是不设置user信息
    next();
  }
};

/**
 * 刷新令牌中间件
 */
export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: '缺少刷新令牌'
        }
      } as ApiResponse);
    }

    // 验证刷新令牌
    const payload = JwtService.verifyToken(token);
    
    // 检查是否为刷新令牌（通过audience字段）
    if (!payload.aud || payload.aud !== 'fitness-system-refresh') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: '无效的刷新令牌'
        }
      } as ApiResponse);
    }

    req.user = payload;
    next();
  } catch (error: any) {
    logger.auth('Refresh token validation failed', {
      error: error.message,
      ip: req.ip
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_003',
        message: '刷新令牌无效或已过期'
      }
    } as ApiResponse);
  }
};