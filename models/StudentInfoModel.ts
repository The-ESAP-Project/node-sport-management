import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export interface StudentInfo {
  id: number;
  StuRegisterNumber: string;
  StuName: string;
  StuGender: '0' | '1';
  StuNation: number;
  StuBirth: string;
  classID: number;
}

export interface StudentInfoCreationAttributes extends Omit<StudentInfo, 'id'> {}

class StudentInfoModel extends Model<StudentInfo, StudentInfoCreationAttributes> implements StudentInfo {
  public id!: number;
  public StuRegisterNumber!: string;
  public StuName!: string;
  public StuGender!: '0' | '1';
  public StuNation!: number;
  public StuBirth!: string;
  public classID!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentInfoModel.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '自增主键'
  },
  StuRegisterNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '学籍号'
  },
  StuName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '学生姓名'
  },
  StuGender: {
    type: DataTypes.ENUM('0', '1'),
    allowNull: false,
    comment: '1: 男, 0: 女'
  },
  StuNation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '民族代码'
  },
  StuBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '出生日期 (YYYY-MM-DD)'
  },
  classID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '班级ID'
  }
}, {
  sequelize,
  tableName: 'StudentInfo',
  timestamps: false
});

export default StudentInfoModel;