import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export interface ClassInfo {
  id: number;
  classID: number;
  className: string;
}

export interface ClassInfoCreationAttributes extends Omit<ClassInfo, 'id'> {}

class ClassInfoModel extends Model<ClassInfo, ClassInfoCreationAttributes> implements ClassInfo {
  public id!: number;
  public classID!: number;
  public className!: string;

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
  }
}, {
  sequelize,
  tableName: 'ClassInfo',
  timestamps: false
});

export default ClassInfoModel;