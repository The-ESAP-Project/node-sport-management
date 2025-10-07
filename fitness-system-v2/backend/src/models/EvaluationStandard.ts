import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 评分标准接口
interface EvaluationStandardAttributes {
  id: number;
  name: string; // 标准名称
  description?: string; // 标准描述
  year: number; // 适用年份
  grade_min: number; // 最小年级
  grade_max: number; // 最大年级
  gender: '0' | '1'; // 性别：0-女，1-男
  sport_item: string; // 体测项目
  
  // 评分标准 - 各个等级的标准值
  excellent_min?: number; // 优秀最低标准
  good_min?: number; // 良好最低标准
  pass_min?: number; // 及格最低标准
  fail_max?: number; // 不及格最高标准
  
  // 是否为时间类型（跑步等，值越小越好）
  is_time_based: boolean;
  
  // 单位
  unit: string; // 如：秒、次、厘米、公斤
  
  // 状态
  is_active: boolean; // 是否启用
  
  // 时间戳
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface EvaluationStandardCreationAttributes 
  extends Optional<EvaluationStandardAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class EvaluationStandard extends Model<EvaluationStandardAttributes, EvaluationStandardCreationAttributes>
  implements EvaluationStandardAttributes {
  
  public id!: number;
  public name!: string;
  public description?: string;
  public year!: number;
  public grade_min!: number;
  public grade_max!: number;
  public gender!: '0' | '1';
  public sport_item!: string;
  
  public excellent_min?: number;
  public good_min?: number;
  public pass_min?: number;
  public fail_max?: number;
  
  public is_time_based!: boolean;
  public unit!: string;
  public is_active!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  /**
   * 根据成绩值计算等级
   * @param value 成绩值
   * @returns 等级字符串
   */
  public calculateGrade(value: number): string {
    if (this.is_time_based) {
      // 时间类型，值越小越好
      if (this.excellent_min !== undefined && value <= this.excellent_min) return '优秀';
      if (this.good_min !== undefined && value <= this.good_min) return '良好';
      if (this.pass_min !== undefined && value <= this.pass_min) return '及格';
      return '不及格';
    } else {
      // 非时间类型，值越大越好
      if (this.excellent_min !== undefined && value >= this.excellent_min) return '优秀';
      if (this.good_min !== undefined && value >= this.good_min) return '良好';
      if (this.pass_min !== undefined && value >= this.pass_min) return '及格';
      return '不及格';
    }
  }

  /**
   * 根据成绩值计算分数（100分制）
   * @param value 成绩值
   * @returns 分数
   */
  public calculateScore(value: number): number {
    const grade = this.calculateGrade(value);
    
    switch (grade) {
      case '优秀':
        return Math.min(100, 90 + Math.random() * 10); // 90-100分
      case '良好':
        return Math.min(89, 80 + Math.random() * 9); // 80-89分
      case '及格':
        return Math.min(79, 60 + Math.random() * 19); // 60-79分
      default:
        return Math.max(0, Math.random() * 59); // 0-59分
    }
  }
}

EvaluationStandard.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '标准名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '标准描述',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '适用年份',
    },
    grade_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最小年级',
    },
    grade_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最大年级',
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      validate: {
        isIn: [['0', '1']],
      },
      comment: '性别：0-女，1-男',
    },
    sport_item: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '体测项目',
    },
    excellent_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '优秀最低标准',
    },
    good_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '良好最低标准',
    },
    pass_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '及格最低标准',
    },
    fail_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '不及格最高标准',
    },
    is_time_based: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否为时间类型',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'evaluation_standards',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['year', 'grade_min', 'grade_max', 'gender', 'sport_item'],
        name: 'idx_evaluation_standards_criteria',
      },
      {
        fields: ['sport_item'],
        name: 'idx_evaluation_standards_sport_item',
      },
      {
        fields: ['is_active'],
        name: 'idx_evaluation_standards_active',
      },
    ],
  }
);

export default EvaluationStandard;