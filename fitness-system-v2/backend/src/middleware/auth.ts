import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
import { UserRole } from '../types/enums';
import { ResponseUtils } from '../utils/helpers';
import config from '../config';
import logger from '../utils/logger';

/**
 * JWT认证中间件
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(ResponseUtils.error('AUTH_MISSING_TOKEN', '缺少认证令牌'));
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      // 检查token是否过期
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        res.status(401).json(ResponseUtils.error('AUTH_TOKEN_EXPIRED', '认证令牌已过期'));
        return;
      }

      // 将用户信息添加到请求对象
      req.user = decoded;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json(ResponseUtils.error('AUTH_TOKEN_EXPIRED', '认证令牌已过期'));
      } else if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json(ResponseUtils.error('AUTH_INVALID_TOKEN', '无效的认证令牌'));
      } else {
        res.status(401).json(ResponseUtils.error('AUTH_VERIFICATION_FAILED', '令牌验证失败'));
      }
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json(ResponseUtils.error('AUTH_INTERNAL_ERROR', '认证过程中发生错误'));
  }
};

/**
 * 管理员权限中间件
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(ResponseUtils.error('AUTH_NO_USER', '用户未认证'));
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json(ResponseUtils.error('AUTH_INSUFFICIENT_PRIVILEGES', '权限不足，需要管理员权限'));
    return;
  }

  next();
};

/**
 * 班级权限中间件
 */
export const requireClass = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(ResponseUtils.error('AUTH_NO_USER', '用户未认证'));
    return;
  }

  if (req.user.role !== UserRole.CLASS && req.user.role !== UserRole.ADMIN) {
    res.status(403).json(ResponseUtils.error('AUTH_INSUFFICIENT_PRIVILEGES', '权限不足，需要班级或管理员权限'));
    return;
  }

  next();
};

/**
 * 检查班级权限（只能访问自己班级的数据）
 */
export const checkClassAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(ResponseUtils.error('AUTH_NO_USER', '用户未认证'));
    return;
  }

  // 管理员可以访问所有数据
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // 班级用户只能访问自己班级的数据
  if (req.user.role === UserRole.CLASS) {
    const requestedClass = req.params.classID || req.query.classID || req.body.classID;
    
    if (requestedClass && req.user.className) {
      // 这里需要根据实际业务逻辑来验证班级权限
      // 目前简化处理，后续可以根据需要完善
      next();
      return;
    }
  }

  res.status(403).json(ResponseUtils.error('AUTH_CLASS_ACCESS_DENIED', '无权访问该班级数据'));
};

/**
 * 可选认证中间件（不强制要求认证）
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有token时继续，但不设置用户信息
    next();
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
  } catch (error) {
    // token无效时也继续，但不设置用户信息
    logger.debug('Optional auth failed:', error);
  }
  
  next();
};

/**
 * 生成JWT令牌
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp' | 'aud' | 'iss'>): string => {
  const now = Math.floor(Date.now() / 1000);
  
  const jwtPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + config.jwt.expiresIn,
    aud: config.jwt.audience,
    iss: config.jwt.issuer
  };

  return jwt.sign(jwtPayload, config.jwt.secret, {
    algorithm: 'HS256'
  });
};

/**
 * 验证令牌（用于刷新等场景）
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * 解码令牌（不验证签名，用于获取过期令牌信息）
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};