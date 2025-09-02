import express, { Request, Response, NextFunction } from 'express';
import UserController from '../controller/UserController';
import UserModel from '../models/UserModel';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getAccessTokenExpiresIn
} from '../utils/jwt';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
  UserProfile
} from '../types/auth';

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
  res: Response<LoginResponse>,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        accessToken: '',
        expires_in: 0,
        user: {} as UserProfile
      });
    }

    // 获取用户档案（不包含密码）
    const userProfile = await UserController.getUserProfileByUsername(username);

    if (!userProfile) {
      return res.status(401).json({
        accessToken: '',
        expires_in: 0,
        user: {} as UserProfile
      });
    }

    // 验证用户状态
    if (userProfile.status !== 'active') {
      return res.status(403).json({
        accessToken: '',
        expires_in: 0,
        user: {} as UserProfile
      });
    }

    // 验证密码（直接使用 UserModel 获取包含密码的数据）
    const dbUser = await UserModel.findOne({ where: { username } });
    if (!dbUser || dbUser.password !== password) {
      return res.status(401).json({
        accessToken: '',
        expires_in: 0,
        user: {} as UserProfile
      });
    }

    // 生成 tokens
    const accessToken = generateAccessToken(userProfile);
    const refreshToken = generateRefreshToken(userProfile);
    const expiresIn = getAccessTokenExpiresIn();

    // 设置 refresh token 到 httpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // 返回 access token 和用户信息
    const response: LoginResponse = {
      accessToken,
      expires_in: expiresIn,
      user: userProfile
    };

    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({
      accessToken: '',
      expires_in: 0,
      user: {} as UserProfile
    });
  }
});

/**
 * POST /auth/refresh
 * 刷新 Access Token
 */
router.post('/refresh', async (
  req: Request,
  res: Response<RefreshResponse>,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        accessToken: '',
        expires_in: 0
      });
    }

    // 验证 refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      // 清除无效的 refresh token
      res.clearCookie('refreshToken');
      return res.status(401).json({
        accessToken: '',
        expires_in: 0
      });
    }

    // 获取用户信息
    const userProfile = await UserController.getUserById(payload.id);
    if (!userProfile) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        accessToken: '',
        expires_in: 0
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

    const response: RefreshResponse = {
      accessToken,
      expires_in: expiresIn
    };

    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({
      accessToken: '',
      expires_in: 0
    });
  }
});

/**
 * POST /auth/logout
 * 用户登出
 */
router.post('/logout', async (
  req: Request,
  res: Response<LogoutResponse>,
  next: NextFunction
) => {
  try {
    // 清除 refresh token cookie
    res.clearCookie('refreshToken');

    const response: LogoutResponse = {
      success: true
    };

    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false
    });
  }
});

export default router;
