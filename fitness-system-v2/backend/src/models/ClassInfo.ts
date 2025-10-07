import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// ClassInfo属性接口
export interface ClassInfoAttributes {
  id: number;
  classID: number;
  className: string;
  grade?: string;
  department?: string;
  academicYear: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ClassInfo创建属性接口
export interface ClassInfoCreationAttributes extends Optional<ClassInfoAttributes, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'> {}

// ClassInfo模型类
class ClassInfo extends Model<ClassInfoAttributes, ClassInfoCreationAttributes> implements ClassInfoAttributes {
  public id!: number;
  public classID!: number;
  public className!: string;
  public grade?: string;
  public department?: string;
  public academicYear!: number;
  public is_deleted?: boolean;
  public deleted_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化ClassInfo模型
ClassInfo.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '自增主键'
    },
    classID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '班级ID',
      field: 'class_i_d'
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '班级名称',
      field: 'class_name'
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '年级'
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '院系/部门'
    },
    academicYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '学年，如 2024 表示 2024-2025 学年',
      field: 'academic_year'
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '软删除标志'
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '删除时间'
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
    tableName: 'ClassInfo',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['class_i_d']
      },
      {
        fields: ['grade']
      },
      {
        fields: ['academic_year']
      },
      {
        fields: ['department']
      }
    ]
  }
);

export default ClassInfo;