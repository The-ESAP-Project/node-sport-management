import User from '../models/User';
import { UserRole, UserStatus } from '../types/enums';
import { PasswordService } from '../utils/password';
import config from '../config';
import logger from '../utils/logger';

export class UserService {
  /**
   * 根据用户名查找用户
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username, status: UserStatus.ACTIVE }
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw new Error('查找用户失败');
    }
  }

  /**
   * 根据ID查找用户
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { id, status: UserStatus.ACTIVE }
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw new Error('查找用户失败');
    }
  }

  /**
   * 创建新用户
   */
  static async createUser(userData: {
    username: string;
    password: string;
    role: UserRole;
    name?: string;
    className?: string;
    grade?: string;
  }): Promise<User> {
    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({
        where: { username: userData.username }
      });

      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 验证密码强度
      const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // 哈希密码
      const hashedPassword = await PasswordService.hashPassword(userData.password);

      // 解析班级信息（如果是班级账号）
      let className = userData.className;
      let grade = userData.grade;

      if (userData.role === UserRole.CLASS && userData.username.includes('-')) {
        const parts = userData.username.split('-');
        if (parts.length >= 2) {
          grade = parts[0];
          className = parts.slice(1).join('-');
        }
      }

      // 创建用户
      const user = await User.create({
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        className,
        grade,
        status: UserStatus.ACTIVE
      });

      logger.business('User created', {
        userId: user.id,
        username: user.username,
        role: user.role,
        className: user.className,
        grade: user.grade
      });

      return user;
    } catch (error: any) {
      logger.error('Error creating user:', error);
      throw new Error(error.message || '创建用户失败');
    }
  }

  /**
   * 验证用户密码
   */
  static async verifyPassword(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByUsername(username);
      if (!user) {
        return null;
      }

      const isPasswordValid = await PasswordService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw new Error('密码验证失败');
    }
  }

  /**
   * 更新用户密码
   */
  static async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      // 验证密码强度
      const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // 哈希新密码
      const hashedPassword = await PasswordService.hashPassword(newPassword);

      // 更新密码
      const [affectedRows] = await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      if (affectedRows === 0) {
        throw new Error('用户不存在');
      }

      logger.business('Password updated', { userId });
      return true;
    } catch (error: any) {
      logger.error('Error updating password:', error);
      throw new Error(error.message || '更新密码失败');
    }
  }

  /**
   * 更新用户状态
   */
  static async updateUserStatus(userId: number, status: UserStatus): Promise<boolean> {
    try {
      const [affectedRows] = await User.update(
        { status },
        { where: { id: userId } }
      );

      if (affectedRows === 0) {
        throw new Error('用户不存在');
      }

      logger.business('User status updated', { userId, status });
      return true;
    } catch (error: any) {
      logger.error('Error updating user status:', error);
      throw new Error(error.message || '更新用户状态失败');
    }
  }

  /**
   * 获取用户列表
   */
  static async getUsers(params: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
  } = {}): Promise<{ users: User[], total: number }> {
    try {
      const { page = 1, limit = 20, role, status } = params;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (role) whereClause.role = role;
      if (status) whereClause.status = status;

      const { rows: users, count: total } = await User.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['password'] }
      });

      return { users, total };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw new Error('获取用户列表失败');
    }
  }
}

/**
 * 创建默认管理员账户
 */
export const createDefaultAdmin = async (): Promise<void> => {
  try {
    // 检查是否已有管理员用户
    const adminExists = await User.findOne({
      where: { role: UserRole.ADMIN }
    });

    if (adminExists) {
      logger.info('Admin user already exists, skipping default admin creation');
      return;
    }

    // 创建默认管理员
    const adminUser = await UserService.createUser({
      username: config.defaultAdmin.username,
      password: config.defaultAdmin.password,
      role: UserRole.ADMIN,
      name: '系统管理员'
    });

    logger.info('✅ Default admin user created successfully', {
      userId: adminUser.id,
      username: adminUser.username
    });

    console.log('✅ Default admin account created:');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Password: ${config.defaultAdmin.password}`);
    console.log('   ⚠️  Please change the default password after first login!');

  } catch (error: any) {
    logger.error('❌ Failed to create default admin user:', error);
    console.error('❌ Error creating default admin account:', error.message);
    // 不抛出错误，避免影响应用启动
  }
};

export default UserService;