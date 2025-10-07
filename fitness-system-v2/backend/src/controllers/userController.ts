import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ResponseUtils, FormatUtils, ValidationUtils } from '../utils/helpers';
import { UserRole, UserStatus } from '../types/enums';
import logger from '../utils/logger';

export class UserController {
  /**
   * 创建用户（仅管理员）
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, role, name, className, grade } = req.body;

      // 参数验证
      if (!username || !password || !role) {
        res.status(400).json(ResponseUtils.error('USER_MISSING_REQUIRED_FIELDS', '用户名、密码和角色不能为空'));
        return;
      }

      // 验证角色
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_ROLE', '无效的用户角色'));
        return;
      }

      // 班级账号需要验证用户名格式
      if (role === UserRole.CLASS && !ValidationUtils.isValidClassUsername(username)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_CLASS_USERNAME', '班级账号用户名格式不正确（应为：年级-班级名）'));
        return;
      }

      // 创建用户
      const user = await UserService.createUser({
        username,
        password,
        role,
        name,
        className,
        grade
      });

      // 格式化响应数据
      const safeUser = FormatUtils.formatUser(user);

      res.status(201).json(ResponseUtils.success(safeUser, '用户创建成功'));
    } catch (error: any) {
      logger.error('Create user error:', error);
      res.status(500).json(ResponseUtils.error('USER_CREATE_FAILED', error.message || '创建用户失败'));
    }
  }

  /**
   * 获取用户列表（仅管理员）
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        status
      } = req.query;

      // 参数验证
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_PAGE', '页码必须是大于0的整数'));
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_LIMIT', '每页数量必须是1-100之间的整数'));
        return;
      }

      // 验证角色和状态参数
      const roleFilter = role && Object.values(UserRole).includes(role as UserRole) ? role as UserRole : undefined;
      const statusFilter = status && Object.values(UserStatus).includes(status as UserStatus) ? status as UserStatus : undefined;

      const result = await UserService.getUsers({
        page: pageNum,
        limit: limitNum,
        role: roleFilter,
        status: statusFilter
      });

      // 格式化用户列表
      const formattedUsers = result.users.map(user => FormatUtils.formatUser(user));

      res.json(ResponseUtils.paginated(formattedUsers, result.total, pageNum, limitNum));
    } catch (error: any) {
      logger.error('Get users error:', error);
      res.status(500).json(ResponseUtils.error('USER_GET_LIST_FAILED', '获取用户列表失败'));
    }
  }

  /**
   * 根据ID获取用户详情（仅管理员）
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_ID', '无效的用户ID'));
        return;
      }

      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json(ResponseUtils.error('USER_NOT_FOUND', '用户不存在'));
        return;
      }

      const safeUser = FormatUtils.formatUser(user);
      res.json(ResponseUtils.success(safeUser, '获取用户详情成功'));
    } catch (error: any) {
      logger.error('Get user by ID error:', error);
      res.status(500).json(ResponseUtils.error('USER_GET_DETAIL_FAILED', '获取用户详情失败'));
    }
  }

  /**
   * 更新用户状态（仅管理员）
   */
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_ID', '无效的用户ID'));
        return;
      }

      if (!status || !Object.values(UserStatus).includes(status)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_STATUS', '无效的用户状态'));
        return;
      }

      // 不能修改自己的状态
      if (req.user && req.user.userId === userId) {
        res.status(403).json(ResponseUtils.error('USER_CANNOT_UPDATE_SELF_STATUS', '不能修改自己的状态'));
        return;
      }

      const success = await UserService.updateUserStatus(userId, status);

      if (!success) {
        res.status(404).json(ResponseUtils.error('USER_NOT_FOUND', '用户不存在'));
        return;
      }

      res.json(ResponseUtils.success(null, '用户状态更新成功'));
    } catch (error: any) {
      logger.error('Update user status error:', error);
      res.status(500).json(ResponseUtils.error('USER_UPDATE_STATUS_FAILED', error.message || '更新用户状态失败'));
    }
  }

  /**
   * 重置用户密码（仅管理员）
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_ID', '无效的用户ID'));
        return;
      }

      if (!newPassword) {
        res.status(400).json(ResponseUtils.error('USER_MISSING_PASSWORD', '新密码不能为空'));
        return;
      }

      const success = await UserService.updatePassword(userId, newPassword);

      if (!success) {
        res.status(404).json(ResponseUtils.error('USER_NOT_FOUND', '用户不存在'));
        return;
      }

      // 记录密码重置日志
      logger.business('Password reset by admin', {
        targetUserId: userId,
        adminUserId: req.user?.userId,
        adminUsername: req.user?.username,
        ip: req.ip
      });

      res.json(ResponseUtils.success(null, '密码重置成功'));
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(500).json(ResponseUtils.error('USER_RESET_PASSWORD_FAILED', error.message || '重置密码失败'));
    }
  }

  /**
   * 批量创建班级账号（仅管理员）
   */
  static async batchCreateClassUsers(req: Request, res: Response): Promise<void> {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json(ResponseUtils.error('USER_INVALID_BATCH_DATA', '批量数据格式不正确'));
        return;
      }

      const results = {
        success: [] as any[],
        failed: [] as any[]
      };

      for (const userData of users) {
        try {
          // 验证必要字段
          if (!userData.username || !userData.password) {
            results.failed.push({
              data: userData,
              error: '用户名和密码不能为空'
            });
            continue;
          }

          // 验证班级用户名格式
          if (!ValidationUtils.isValidClassUsername(userData.username)) {
            results.failed.push({
              data: userData,
              error: '班级账号用户名格式不正确（应为：年级-班级名）'
            });
            continue;
          }

          const user = await UserService.createUser({
            username: userData.username,
            password: userData.password,
            role: UserRole.CLASS,
            name: userData.name,
            className: userData.className,
            grade: userData.grade
          });

          results.success.push(FormatUtils.formatUser(user));
        } catch (error: any) {
          results.failed.push({
            data: userData,
            error: error.message
          });
        }
      }

      // 记录批量创建日志
      logger.business('Batch create class users', {
        totalCount: users.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        adminUserId: req.user?.userId,
        adminUsername: req.user?.username
      });

      res.json(ResponseUtils.success(results, `批量创建完成，成功${results.success.length}个，失败${results.failed.length}个`));
    } catch (error: any) {
      logger.error('Batch create class users error:', error);
      res.status(500).json(ResponseUtils.error('USER_BATCH_CREATE_FAILED', '批量创建用户失败'));
    }
  }

  /**
   * 获取班级账号列表（仅管理员）
   */
  static async getClassUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        grade,
        className
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await UserService.getUsers({
        page: pageNum,
        limit: limitNum,
        role: UserRole.CLASS,
        status: UserStatus.ACTIVE
      });

      // 根据年级和班级名过滤
      let filteredUsers = result.users;
      
      if (grade) {
        filteredUsers = filteredUsers.filter(user => user.grade === grade);
      }
      
      if (className) {
        filteredUsers = filteredUsers.filter(user => 
          user.className && user.className.includes(className as string)
        );
      }

      const formattedUsers = filteredUsers.map(user => FormatUtils.formatUser(user));

      res.json(ResponseUtils.paginated(formattedUsers, filteredUsers.length, pageNum, limitNum));
    } catch (error: any) {
      logger.error('Get class users error:', error);
      res.status(500).json(ResponseUtils.error('USER_GET_CLASS_USERS_FAILED', '获取班级账号列表失败'));
    }
  }
}

export default UserController;