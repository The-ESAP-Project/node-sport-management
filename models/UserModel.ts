import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import type { UserRole, UserStatus } from '../types/user';

// 数据库用户模型接口
export interface User {
  id: number;
  username: string;
  name?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes extends Omit<User, 'id' | 'created_at' | 'updated_at'> {}

class UserModel extends Model<User, UserCreationAttributes> implements User {
  public id!: number;
  public username!: string;
  public name!: string;
  public password!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserModel.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '自增主键'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '用户姓名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码哈希'
  },
  role: {
    type: DataTypes.ENUM('admin', 'reporter'),
    allowNull: false,
    defaultValue: 'reporter',
    comment: '用户角色'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    allowNull: false,
    defaultValue: 'active',
    comment: '用户状态'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  sequelize,
  tableName: 'User',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export default UserModel;