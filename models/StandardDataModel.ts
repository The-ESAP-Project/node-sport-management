import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export interface StandardData {
  id: number;
  year: number;
  gradeID: number;
  classID: number;
  height?: number;
  weight?: number;
  vitalCapacity?: number;
  fiftyRun?: number;
  standingLongJump?: number;
  sitAndReach?: number;
  fiftyRunGrade?: string;
  standingLongJumpGrade?: string;
  sitAndReachGrade?: string;
  eightHundredRun?: number;
  oneThousandRun?: number;
  sitUp?: number;
  pullUp?: number;
}

export interface StandardDataCreationAttributes extends Omit<StandardData, 'id'> {}

class StandardDataModel extends Model<StandardData, StandardDataCreationAttributes> implements StandardData {
  public id!: number;
  public year!: number;
  public gradeID!: number;
  public classID!: number;
  public height?: number;
  public weight?: number;
  public vitalCapacity?: number;
  public fiftyRun?: number;
  public standingLongJump?: number;
  public sitAndReach?: number;
  public fiftyRunGrade?: string;
  public standingLongJumpGrade?: string;
  public sitAndReachGrade?: string;
  public eightHundredRun?: number;
  public oneThousandRun?: number;
  public sitUp?: number;
  public pullUp?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StandardDataModel.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '自增主键'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '年份'
  },
  gradeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '年级ID'
  },
  classID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '班级ID'
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '身高'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '体重'
  },
  vitalCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '肺活量'
  },
  fiftyRun: {
    type: DataTypes.FLOAT(5, 2),
    allowNull: true,
    comment: '50米跑'
  },
  standingLongJump: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '立定跳远'
  },
  sitAndReach: {
    type: DataTypes.FLOAT(5, 1),
    allowNull: true,
    comment: '坐位体前屈'
  },
  fiftyRunGrade: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '50米跑等级'
  },
  standingLongJumpGrade: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '立定跳远等级'
  },
  sitAndReachGrade: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '坐位体前屈等级'
  },
  eightHundredRun: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '800米跑'
  },
  oneThousandRun: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '1000米跑'
  },
  sitUp: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '仰卧起坐'
  },
  pullUp: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '引体向上'
  }
}, {
  sequelize,
  tableName: 'StandardData',
  timestamps: false
});

export default StandardDataModel;