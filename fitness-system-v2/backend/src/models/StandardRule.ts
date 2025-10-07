import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Standard from './Standard';

// 体测项目枚举 - 与SportData字段对应
export enum SportItem {
  HEIGHT = 'height',
  WEIGHT = 'weight', 
  VITAL_CAPACITY = 'vitalCapacity',
  FIFTY_RUN = 'fiftyRun',
  STANDING_LONG_JUMP = 'standingLongJump',
  SIT_AND_REACH = 'sitAndReach',
  EIGHT_HUNDRED_RUN = 'eightHundredRun',
  ONE_THOUSAND_RUN = 'oneThousandRun',
  SIT_UP = 'sitUp',
  PULL_UP = 'pullUp'
}

// 评分方向枚举
export enum ScoreDirection {
  HIGHER_BETTER = 'higher_better',
  LOWER_BETTER = 'lower_better'
}

// StandardRule属性接口
export interface StandardRuleAttributes {
  id: number;
  standard_id: number;
  item: SportItem;
  gender: '0' | '1'; // 保持与Student一致：1男，0女
  unit: string;
  weight: number;
  direction: ScoreDirection;
  ranges: Array<{
    min: number | null;
    max: number | null;
    score: number;
  }>;
  created_at: Date;
  updated_at: Date;
}

// StandardRule创建属性接口
export interface StandardRuleCreationAttributes extends Optional<StandardRuleAttributes, 'id' | 'created_at' | 'updated_at'> {}

// StandardRule模型类
class StandardRule extends Model<StandardRuleAttributes, StandardRuleCreationAttributes> implements StandardRuleAttributes {
  public id!: number;
  public standard_id!: number;
  public item!: SportItem;
  public gender!: '0' | '1';
  public unit!: string;
  public weight!: number;
  public direction!: ScoreDirection;
  public ranges!: Array<{
    min: number | null;
    max: number | null;
    score: number;
  }>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化StandardRule模型
StandardRule.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '评分规则ID'
    },
    standard_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Standard,
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: '评分标准ID'
    },
    item: {
      type: DataTypes.ENUM(...Object.values(SportItem)),
      allowNull: false,
      comment: '体测项目'
    },
    gender: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      comment: '性别：1男，0女'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    weight: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: '权重（总和为1）'
    },
    direction: {
      type: DataTypes.ENUM(...Object.values(ScoreDirection)),
      allowNull: false,
      comment: '评分方向'
    },
    ranges: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '分数区间配置（JSON格式）'
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
    tableName: 'StandardRule',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['standard_id']
      },
      {
        fields: ['item']
      },
      {
        fields: ['gender']
      },
      {
        unique: true,
        fields: ['standard_id', 'item', 'gender'],
        name: 'unique_rule_per_item_gender'
      }
    ]
  }
);

// 关联关系
StandardRule.belongsTo(Standard, { foreignKey: 'standard_id' });
Standard.hasMany(StandardRule, { foreignKey: 'standard_id' });

export default StandardRule;