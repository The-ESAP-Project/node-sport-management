import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Student from './Student';
import ClassInfo from './ClassInfo';

// SportData属性接口（保持与之前一致的宽表设计）
export interface SportDataAttributes {
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
  totalScore?: number;
  classRank?: number;
  gradeRank?: number;
  created_at: Date;
  updated_at: Date;
}

// SportData创建属性接口
export interface SportDataCreationAttributes extends Optional<SportDataAttributes, 'id' | 'created_at' | 'updated_at'> {}

// SportData模型类
class SportData extends Model<SportDataAttributes, SportDataCreationAttributes> implements SportDataAttributes {
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
  public totalScore?: number;
  public classRank?: number;
  public gradeRank?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联对象
  public Student?: Student;
  public ClassInfo?: ClassInfo;

  // 时间格式化方法（保持与之前一致）
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

// 初始化SportData模型
SportData.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '自增主键'
    },
    studentID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Student,
        key: 'id'
      },
      comment: '学生ID',
      field: 'student_i_d'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '年份'
    },
    gradeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '年级ID',
      field: 'grade_i_d'
    },
    classID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ClassInfo,
        key: 'class_i_d'
      },
      comment: '班级ID',
      field: 'class_i_d'
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
      comment: '肺活量 (mL)',
      field: 'vital_capacity'
    },
    fiftyRun: {
      type: DataTypes.FLOAT(5, 2),
      allowNull: true,
      comment: '50米跑 (秒)',
      field: 'fifty_run'
    },
    standingLongJump: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '立定跳远 (cm)',
      field: 'standing_long_jump'
    },
    sitAndReach: {
      type: DataTypes.FLOAT(5, 1),
      allowNull: true,
      comment: '坐位体前屈 (cm)',
      field: 'sit_and_reach'
    },
    eightHundredRun: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '800米跑 (秒)',
      field: 'eight_hundred_run'
    },
    oneThousandRun: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1000米跑 (秒)',
      field: 'one_thousand_run'
    },
    sitUp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1分钟仰卧起坐 (个)',
      field: 'sit_up'
    },
    pullUp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '引体向上 (个)',
      field: 'pull_up'
    },
    totalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '总分',
      field: 'total_score'
    },
    classRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '班级排名',
      field: 'class_rank'
    },
    gradeRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '年级排名',
      field: 'grade_rank'
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
    tableName: 'SportData',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['student_i_d']
      },
      {
        fields: ['year']
      },
      {
        fields: ['class_i_d']
      },
      {
        fields: ['grade_i_d']
      },
      {
        fields: ['total_score']
      },
      {
        unique: true,
        fields: ['student_i_d', 'year'],
        name: 'unique_student_year'
      }
    ]
  }
);

// 关联关系
SportData.belongsTo(Student, { foreignKey: 'studentID' });
SportData.belongsTo(ClassInfo, { foreignKey: 'classID', targetKey: 'classID' });
Student.hasMany(SportData, { foreignKey: 'studentID' });
ClassInfo.hasMany(SportData, { foreignKey: 'classID', sourceKey: 'classID' });

export default SportData;