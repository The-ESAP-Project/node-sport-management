import express, { Request, Response, NextFunction } from 'express';
import UserController from '../controller/UserController';
import UserModel from '../models/UserModel';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  getAccessTokenExpiresIn
} from '../utils/jwt';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
  UserProfile,
  VerifyTokenResponse
} from '../types/auth';
import { ApiResponse } from '../types/api';
import { ErrorCode, ErrorMessages } from '../types/error';
import PasswordUtils from '../utils/password';
import Logger from '../utils/logger';
import type { User } from '../types/user';

const router = express.Router();

// Cookie 配置
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
};

/**
 * POST /auth/login
 * 用户登录
 */
router.post('/login', async (
  req: Request<{}, LoginResponse, LoginRequest>,
  res: Response<LoginResponse | ApiResponse<null>>,
  next: NextFunction
) => {
  const { username, password } = req.body;
  const clientIP = Logger.getClientIP(req);

  try {
    // 记录登录尝试
    Logger.auth.loginAttempt(username, clientIP);

    if (!username || !password) {
      Logger.auth.loginFailed(username, 'missing_credentials', clientIP);
      return res.status(400).json({
        code: ErrorCode.BadRequest,
        message: ErrorMessages[ErrorCode.BadRequest],
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 获取用户档案（不包含密码）
    const userProfile = await UserController.getUserProfileByUsername(username);

    if (!userProfile) {
      Logger.auth.loginFailed(username, 'user_not_found', clientIP);
      return res.status(401).json({
        code: ErrorCode.AuthFailed,
        message: ErrorMessages[ErrorCode.AuthFailed],
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证用户状态
    if (userProfile.status !== 'active') {
      Logger.auth.loginFailed(username, `user_inactive_${userProfile.status}`, clientIP);
      return res.status(403).json({
        code: ErrorCode.Unauthorized,
        message: 'User account is inactive',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证密码（使用 argon2 安全验证）
    const dbUser = await UserModel.findOne({ where: { username } });
    if (!dbUser) {
      return res.status(401).json({
        code: ErrorCode.AuthFailed,
        message: ErrorMessages[ErrorCode.AuthFailed],
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 使用 argon2 验证密码
    const isPasswordValid = await PasswordUtils.verifyPassword(dbUser.password, password);
    if (!isPasswordValid) {
      Logger.auth.loginFailed(username, 'invalid_password', clientIP);
      return res.status(401).json({
        code: ErrorCode.AuthFailed,
        message: ErrorMessages[ErrorCode.AuthFailed],
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 生成 tokens
    const accessToken = generateAccessToken(userProfile);
    const refreshToken = generateRefreshToken(userProfile);
    const expiresIn = getAccessTokenExpiresIn();

    // 设置 refresh token 到 httpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // 记录登录成功
    Logger.auth.loginSuccess(username, userProfile.id, clientIP);

    // 返回 access token 和用户信息
    const response: LoginResponse = {
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: {
        accessToken,
        expires_in: expiresIn,
        user: userProfile
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (err: any) {
    Logger.error(`登录过程中发生错误: ${err.message}`, {
      username,
      error: err.message,
      stack: err.stack,
      ip: clientIP
    });
    return res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: {
        accessToken: '',
        expires_in: 0,
        user: {} as UserProfile
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /auth/refresh
 * 刷新 Access Token
 */
router.post('/refresh', async (
  req: Request,
  res: Response<RefreshResponse | ApiResponse<null>>,
  next: NextFunction
) => {
  const clientIP = Logger.getClientIP(req);

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      Logger.auth.tokenRefreshFailed('no_refresh_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: ErrorMessages[ErrorCode.Unauthorized],
        data: {
          accessToken: '',
          expires_in: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // 验证 refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      // 清除无效的 refresh token
      res.clearCookie('refreshToken');
      Logger.auth.tokenRefreshFailed('invalid_refresh_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: ErrorMessages[ErrorCode.Unauthorized],
        data: {
          accessToken: '',
          expires_in: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // 获取用户信息
    const userProfile = await UserController.getUserById(payload.id);
    if (!userProfile) {
      res.clearCookie('refreshToken');
      Logger.auth.tokenRefreshFailed('user_not_found', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: ErrorMessages[ErrorCode.Unauthorized],
        data: {
          accessToken: '',
          expires_in: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // 生成新的 access token
    const accessToken = generateAccessToken({
      id: userProfile.id,
      username: userProfile.username,
      name: userProfile.name,
      role: userProfile.role,
      status: userProfile.status
    });
    const expiresIn = getAccessTokenExpiresIn();

    // 记录 token 刷新成功
    Logger.auth.tokenRefresh(userProfile.username, userProfile.id, clientIP);

    const response: RefreshResponse = {
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: {
        accessToken,
        expires_in: expiresIn
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (err: any) {
    Logger.error(`Token 刷新过程中发生错误: ${err.message}`, {
      error: err.message,
      stack: err.stack,
      ip: clientIP
    });
    return res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: {
        accessToken: '',
        expires_in: 0
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /auth/logout
 * 用户登出
 */
router.post('/logout', async (
  req: Request,
  res: Response<LogoutResponse | ApiResponse<null>>,
  next: NextFunction
) => {
  const clientIP = Logger.getClientIP(req);

  try {
    // 清除 refresh token cookie
    res.clearCookie('refreshToken');

    // 记录登出事件（由于是无状态的，这里记录IP地址）
    Logger.auth.logout(undefined, undefined, clientIP);

    const response: LogoutResponse = {
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: {
        success: true
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (err: any) {
    Logger.error(`登出过程中发生错误: ${err.message}`, {
      error: err.message,
      stack: err.stack,
      ip: clientIP
    });
    return res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: {
        success: false
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /auth/verify-token
 * 验证 Access Token 是否有效
 */
router.get('/verify-token', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIP = Logger.getClientIP(req);

  try {
    // 从 Authorization header 中提取 token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      Logger.auth.unauthorized('missing_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'Authorization token missing',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证 access token
    const payload = verifyAccessToken(token);
    if (!payload) {
      Logger.auth.unauthorized('invalid_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'Invalid or expired token',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 检查用户是否仍然存在且活跃
    const userProfile = await UserController.getUserById(payload.id);
    if (!userProfile || userProfile.status !== 'active') {
      Logger.auth.unauthorized('user_inactive_or_not_found', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'User account is inactive or not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // Token 验证成功，返回 204 No Content
    Logger.info(`Token 验证成功`, {
      username: userProfile.username,
      userId: userProfile.id,
      ip: clientIP,
      action: 'token_verified'
    });

    return res.status(204).send(); // 204 No Content - 成功但无内容返回

  } catch (err: any) {
    Logger.error(`Token 验证过程中发生错误: ${err.message}`, {
      error: err.message,
      stack: err.stack,
      ip: clientIP
    });
    return res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /auth/me
 * 获取当前用户信息
 */
router.get('/me', async (
  req: Request,
  res: Response<ApiResponse<User> | ApiResponse<null>>,
  next: NextFunction
) => {
  const clientIP = Logger.getClientIP(req);

  try {
    // 从 Authorization header 中提取 token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      Logger.auth.unauthorized('missing_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'Authorization token missing',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证 access token
    const payload = verifyAccessToken(token);
    if (!payload) {
      Logger.auth.unauthorized('invalid_token', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'Invalid or expired token',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 获取用户的完整信息
    const user = await UserController.getUserById(payload.id);
    if (!user) {
      Logger.auth.unauthorized('user_not_found', clientIP);
      return res.status(401).json({
        code: ErrorCode.Unauthorized,
        message: 'User not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      Logger.auth.unauthorized(`user_inactive_${user.status}`, clientIP);
      return res.status(403).json({
        code: ErrorCode.Unauthorized,
        message: 'User account is inactive',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 记录用户信息获取成功
    Logger.info(`获取用户信息成功`, {
      username: user.username,
      userId: user.id,
      ip: clientIP,
      action: 'get_current_user'
    });

    // 返回用户信息
    const response: ApiResponse<User> = {
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: user,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);

  } catch (err: any) {
    Logger.error(`获取用户信息过程中发生错误: ${err.message}`, {
      error: err.message,
      stack: err.stack,
      ip: clientIP
    });
    return res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
