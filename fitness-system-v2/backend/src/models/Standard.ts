import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Standard属性接口
export interface StandardAttributes {
  id: number;
  name: string;
  year: number;
  version: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Standard创建属性接口
export interface StandardCreationAttributes extends Optional<StandardAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Standard模型类
class Standard extends Model<StandardAttributes, StandardCreationAttributes> implements StandardAttributes {
  public id!: number;
  public name!: string;
  public year!: number;
  public version!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化Standard模型
Standard.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '评分标准ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '标准名称'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '适用年份'
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '1.0',
      comment: '版本号'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否激活'
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
    tableName: 'Standard',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['year']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['year', 'name'],
        name: 'unique_standard_per_year'
      }
    ]
  }
);

export default Standard;