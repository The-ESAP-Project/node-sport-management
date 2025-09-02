import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export interface SportData {
  id: number;
  studentID: number;
  year: number;
  gradeID: number;
  classID: number;
  height?: number;
  weight?: number;
  vitalCapacity?: number;
  fiftyRun?: number;
  standingLongJump?: number;
  sitAndReach?: number;
  eightHundredRun?: number;
  oneThousandRun?: number;
  sitUp?: number;
  pullUp?: number;
  score?: number;
}

export interface SportDataCreationAttributes extends Omit<SportData, 'id'> {}

class SportDataModel extends Model<SportData, SportDataCreationAttributes> implements SportData {
  public id!: number;
  public studentID!: number;
  public year!: number;
  public gradeID!: number;
  public classID!: number;
  public height?: number;
  public weight?: number;
  public vitalCapacity?: number;
  public fiftyRun?: number;
  public standingLongJump?: number;
  public sitAndReach?: number;
  public eightHundredRun?: number;
  public oneThousandRun?: number;
  public sitUp?: number;
  public pullUp?: number;
  public score?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getEightHundredRunFormatted(): string | null {
    if (this.eightHundredRun === null || this.eightHundredRun === undefined) return null;
    const minutes = Math.floor(this.eightHundredRun / 60);
    const seconds = this.eightHundredRun % 60;
    return `${minutes}'${seconds.toString().padStart(2, '0')}`;
  }

  public getOneThousandRunFormatted(): string | null {
    if (this.oneThousandRun === null || this.oneThousandRun === undefined) return null;
    const minutes = Math.floor(this.oneThousandRun / 60);
    const seconds = this.oneThousandRun % 60;
    return `${minutes}'${seconds.toString().padStart(2, '0')}`;
  }
}

SportDataModel.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '自增主键'
  },
  studentID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '学生ID'
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
    comment: '身高 (cm)'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '体重 (kg)'
  },
  vitalCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '肺活量 (mL)'
  },
  fiftyRun: {
    type: DataTypes.FLOAT(5, 2),
    allowNull: true,
    comment: '50米跑 (秒数)'
  },
  standingLongJump: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '立定跳远 (cm)'
  },
  sitAndReach: {
    type: DataTypes.FLOAT(5, 1),
    allowNull: true,
    comment: '坐位体前屈 (cm)'
  },
  eightHundredRun: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '800米跑 (秒数)'
  },
  oneThousandRun: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '1000米跑 (秒数)'
  },
  sitUp: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '仰卧起坐 (个数)'
  },
  pullUp: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '引体向上 (个数)'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '综合成绩'
  }
}, {
  sequelize,
  tableName: 'SportData',
  timestamps: false
});

export default SportDataModel;
