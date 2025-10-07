import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ResponseUtils, FormatUtils } from '../utils/helpers';
import { generateToken, verifyToken } from '../middleware/auth';
import { UserLoginRequest, UserLoginResponse } from '../types';
import logger from '../utils/logger';
import config from '../config';

export class AuthController {
  /**
   * 用户登录
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: UserLoginRequest = req.body;

      // 参数验证
      if (!username || !password) {
        res.status(400).json(ResponseUtils.error('AUTH_MISSING_CREDENTIALS', '用户名和密码不能为空'));
        return;
      }

      // 验证用户名和密码
      const user = await UserService.verifyPassword(username, password);
      
      if (!user) {
        res.status(401).json(ResponseUtils.error('AUTH_INVALID_CREDENTIALS', '用户名或密码错误'));
        return;
      }

      // 生成JWT令牌
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        className: user.className,
        grade: user.grade
      });

      // 格式化用户信息（移除敏感字段）
      const safeUser = FormatUtils.formatUser(user);

      // 构造响应
      const response: UserLoginResponse = {
        token,
        user: safeUser,
        expiresIn: `${config.jwt.expiresIn}s`
      };

      // 记录登录日志
      logger.business('User login successful', {
        userId: user.id,
        username: user.username,
        role: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(ResponseUtils.success(response, '登录成功'));
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_LOGIN_FAILED', error.message || '登录失败'));
    }
  }

  /**
   * 用户登出
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // 在实际应用中，可以将token加入黑名单
      // 这里简化处理，只记录登出日志
      
      if (req.user) {
        logger.business('User logout', {
          userId: req.user.userId,
          username: req.user.username,
          ip: req.ip
        });
      }

      res.json(ResponseUtils.success(null, '登出成功'));
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_LOGOUT_FAILED', '登出失败'));
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseUtils.error('AUTH_NO_USER', '用户未认证'));
        return;
      }

      // 从数据库获取最新的用户信息
      const user = await UserService.findById(req.user.userId);
      
      if (!user) {
        res.status(404).json(ResponseUtils.error('AUTH_USER_NOT_FOUND', '用户不存在'));
        return;
      }

      // 格式化用户信息
      const safeUser = FormatUtils.formatUser(user);

      res.json(ResponseUtils.success(safeUser, '获取用户信息成功'));
    } catch (error: any) {
      logger.error('Get current user error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_GET_USER_FAILED', '获取用户信息失败'));
    }
  }

  /**
   * 刷新令牌
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(ResponseUtils.error('AUTH_MISSING_REFRESH_TOKEN', '缺少刷新令牌'));
        return;
      }

      // 验证刷新令牌
      const decoded = verifyToken(refreshToken);
      
      if (!decoded) {
        res.status(401).json(ResponseUtils.error('AUTH_INVALID_REFRESH_TOKEN', '无效的刷新令牌'));
        return;
      }

      // 验证用户是否仍然存在且活跃
      const user = await UserService.findById(decoded.userId);
      
      if (!user) {
        res.status(404).json(ResponseUtils.error('AUTH_USER_NOT_FOUND', '用户不存在'));
        return;
      }

      // 生成新的访问令牌
      const newToken = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        className: user.className,
        grade: user.grade
      });

      // 记录令牌刷新日志
      logger.business('Token refreshed', {
        userId: user.id,
        username: user.username,
        ip: req.ip
      });

      res.json(ResponseUtils.success({
        token: newToken,
        expiresIn: `${config.jwt.expiresIn}s`
      }, '令牌刷新成功'));
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_REFRESH_FAILED', '令牌刷新失败'));
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseUtils.error('AUTH_NO_USER', '用户未认证'));
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // 参数验证
      if (!currentPassword || !newPassword) {
        res.status(400).json(ResponseUtils.error('AUTH_MISSING_PASSWORDS', '当前密码和新密码不能为空'));
        return;
      }

      // 验证当前密码
      const user = await UserService.verifyPassword(req.user.username, currentPassword);
      
      if (!user) {
        res.status(401).json(ResponseUtils.error('AUTH_INVALID_CURRENT_PASSWORD', '当前密码错误'));
        return;
      }

      // 更新密码
      await UserService.updatePassword(req.user.userId, newPassword);

      // 记录密码修改日志
      logger.business('Password changed', {
        userId: req.user.userId,
        username: req.user.username,
        ip: req.ip
      });

      res.json(ResponseUtils.success(null, '密码修改成功'));
    } catch (error: any) {
      logger.error('Change password error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_CHANGE_PASSWORD_FAILED', error.message || '密码修改失败'));
    }
  }

  /**
   * 验证令牌有效性
   */
  static async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json(ResponseUtils.error('AUTH_MISSING_TOKEN', '缺少令牌'));
        return;
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        res.status(401).json(ResponseUtils.error('AUTH_INVALID_TOKEN', '无效的令牌'));
        return;
      }

      // 检查用户是否仍然存在且活跃
      const user = await UserService.findById(decoded.userId);
      
      if (!user) {
        res.status(404).json(ResponseUtils.error('AUTH_USER_NOT_FOUND', '用户不存在'));
        return;
      }

      res.json(ResponseUtils.success({
        valid: true,
        user: FormatUtils.formatUser(user),
        expiresAt: new Date(decoded.exp! * 1000)
      }, '令牌有效'));
    } catch (error: any) {
      logger.error('Validate token error:', error);
      res.status(500).json(ResponseUtils.error('AUTH_VALIDATE_FAILED', '令牌验证失败'));
    }
  }
}

export default AuthController;