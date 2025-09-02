import UserModel, { User } from '../models/UserModel';
import type { UserModel as UserDB, CreateUserRequest, UpdateUserRequest, User as UserResponse } from '../types/user';
import type { UserProfile } from '../types/auth';

class UserController {
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await UserModel.findAll();
    return users.map(user => this.formatUserResponse(user));
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await UserModel.findByPk(id);
    return user ? this.formatUserResponse(user) : null;
  }

  async getUserByUsername(username: string): Promise<UserResponse | null> {
    const user = await UserModel.findOne({ where: { username } });
    return user ? this.formatUserResponse(user) : null;
  }

  async getUserProfileByUsername(username: string): Promise<UserProfile | null> {
    const user = await UserModel.findOne({ where: { username } });
    return user ? this.formatUserProfile(user) : null;
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const user = await UserModel.create({
      ...data,
      status: 'active' as const
    });
    return this.formatUserResponse(user);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse | null> {
    const [affectedRows] = await UserModel.update(data, { where: { id } });
    if (affectedRows > 0) {
      const user = await UserModel.findByPk(id);
      return user ? this.formatUserResponse(user) : null;
    }
    return null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const affectedRows = await UserModel.destroy({ where: { id } });
    return affectedRows > 0;
  }

  // 格式化数据库模型为 API 响应格式
  private formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    };
  }

  // 格式化数据库模型为用户档案格式（用于认证）
  private formatUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    };
  }
}

export default new UserController();