import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export interface ClassInfo {
  id: number;
  classID: number;
  className: string;
  grade?: string;
  department?: string;
  academicYear: number; // 学年，如 2024 表示 2024-2025 学年
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface ClassInfoCreationAttributes extends Omit<ClassInfo, 'id'> {}

class ClassInfoModel extends Model<ClassInfo, ClassInfoCreationAttributes> implements ClassInfo {
  public id!: number;
  public classID!: number;
  public className!: string;
  public grade?: string;
  public department?: string;
  public academicYear!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClassInfoModel.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '自增主键'
  },
  classID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '班级ID'
  },
  className: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '班级名称'
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
    comment: '学年，如 2024 表示 2024-2025 学年'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '软删除标志'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '删除时间'
  }
}, {
  sequelize,
  tableName: 'ClassInfo',
  timestamps: false
});

export default ClassInfoModel;