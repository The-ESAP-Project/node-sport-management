import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import ClassInfo from './ClassInfo';

// Student属性接口（类似之前的StudentInfo）
export interface StudentAttributes {
  id: number;
  StuRegisterNumber: string;
  StuName: string;
  StuGender: '0' | '1'; // 保持与之前一致：1男，0女
  StuNation: number;
  StuBirth: string;
  classID: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Student创建属性接口
export interface StudentCreationAttributes extends Optional<StudentAttributes, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'> {}

// Student模型类
class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: number;
  public StuRegisterNumber!: string;
  public StuName!: string;
  public StuGender!: '0' | '1';
  public StuNation!: number;
  public StuBirth!: string;
  public classID!: number;
  public is_deleted?: boolean;
  public deleted_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联的ClassInfo
  public ClassInfo?: ClassInfo;
}

// 初始化Student模型
Student.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '自增主键'
    },
    StuRegisterNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
      comment: '性别：1男，0女'
    },
    StuNation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
      references: {
        model: ClassInfo,
        key: 'class_i_d'
      },
      comment: '班级ID',
      field: 'class_i_d'
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
    tableName: 'StudentInfo',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['stu_register_number']
      },
      {
        fields: ['class_i_d']
      },
      {
        fields: ['stu_gender']
      },
      {
        fields: ['stu_name']
      }
    ]
  }
);

// 关联关系
Student.belongsTo(ClassInfo, { foreignKey: 'classID', targetKey: 'classID' });
ClassInfo.hasMany(Student, { foreignKey: 'classID', sourceKey: 'classID' });

export default Student;