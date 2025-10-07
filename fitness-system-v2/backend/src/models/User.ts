import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole, UserStatus } from '../types/enums';

// User属性接口
export interface UserAttributes {
  id: number;
  username: string;
  name?: string;
  password: string;
  role: UserRole;
  className?: string;
  grade?: string;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

// User创建属性接口
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

// User模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public name?: string;
  public password!: string;
  public role!: UserRole;
  public className?: string;
  public grade?: string;
  public status!: UserStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化User模型
User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '用户名（班级账号格式：年级-班级名）'
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
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CLASS,
      comment: '用户角色'
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '班级名称',
      field: 'class_name'
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '年级'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
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
  },
  {
    sequelize,
    tableName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      },
      {
        fields: ['class_name']
      },
      {
        fields: ['grade']
      }
    ]
  }
);

export default User;