import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 系统配置接口
interface SystemConfigAttributes {
  id: number;
  key: string; // 配置键
  value: string; // 配置值
  type: 'string' | 'number' | 'boolean' | 'json' | 'date'; // 值类型
  category: string; // 配置分类
  name: string; // 配置名称
  description?: string; // 配置描述
  is_public: boolean; // 是否公开（前端可访问）
  is_readonly: boolean; // 是否只读
  default_value?: string; // 默认值
  validation_rule?: string; // 验证规则（JSON格式）
  
  // 时间戳
  created_at: Date;
  updated_at: Date;
}

interface SystemConfigCreationAttributes 
  extends Optional<SystemConfigAttributes, 'id' | 'created_at' | 'updated_at'> {}

class SystemConfig extends Model<SystemConfigAttributes, SystemConfigCreationAttributes>
  implements SystemConfigAttributes {
  
  public id!: number;
  public key!: string;
  public value!: string;
  public type!: 'string' | 'number' | 'boolean' | 'json' | 'date';
  public category!: string;
  public name!: string;
  public description?: string;
  public is_public!: boolean;
  public is_readonly!: boolean;
  public default_value?: string;
  public validation_rule?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  /**
   * 获取解析后的值
   */
  public getParsedValue(): any {
    try {
      switch (this.type) {
        case 'number':
          return Number(this.value);
        case 'boolean':
          return this.value === 'true';
        case 'json':
          return JSON.parse(this.value);
        case 'date':
          return new Date(this.value);
        default:
          return this.value;
      }
    } catch (error) {
      console.error(`Error parsing config value for key ${this.key}:`, error);
      return this.value;
    }
  }

  /**
   * 设置值（会根据类型进行转换）
   */
  public setParsedValue(value: any): void {
    switch (this.type) {
      case 'number':
        this.value = String(Number(value));
        break;
      case 'boolean':
        this.value = String(Boolean(value));
        break;
      case 'json':
        this.value = JSON.stringify(value);
        break;
      case 'date':
        this.value = new Date(value).toISOString();
        break;
      default:
        this.value = String(value);
    }
  }

  /**
   * 验证值是否符合规则
   */
  public validateValue(value: any): { isValid: boolean; error?: string } {
    if (!this.validation_rule) {
      return { isValid: true };
    }

    try {
      const rule = JSON.parse(this.validation_rule);
      
      switch (this.type) {
        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return { isValid: false, error: '值必须是数字' };
          }
          if (rule.min !== undefined && numValue < rule.min) {
            return { isValid: false, error: `值不能小于${rule.min}` };
          }
          if (rule.max !== undefined && numValue > rule.max) {
            return { isValid: false, error: `值不能大于${rule.max}` };
          }
          break;
          
        case 'string':
          const strValue = String(value);
          if (rule.minLength !== undefined && strValue.length < rule.minLength) {
            return { isValid: false, error: `长度不能少于${rule.minLength}个字符` };
          }
          if (rule.maxLength !== undefined && strValue.length > rule.maxLength) {
            return { isValid: false, error: `长度不能超过${rule.maxLength}个字符` };
          }
          if (rule.pattern && !new RegExp(rule.pattern).test(strValue)) {
            return { isValid: false, error: '格式不符合要求' };
          }
          if (rule.enum && !rule.enum.includes(strValue)) {
            return { isValid: false, error: `值必须是以下之一：${rule.enum.join(', ')}` };
          }
          break;
          
        case 'json':
          try {
            JSON.parse(value);
          } catch {
            return { isValid: false, error: '值必须是有效的JSON格式' };
          }
          break;
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: true }; // 如果验证规则有问题，默认通过
    }
  }
}

SystemConfig.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '配置键',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '配置值',
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'date'),
      allowNull: false,
      defaultValue: 'string',
      comment: '值类型',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '配置分类',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '配置名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配置描述',
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否公开',
    },
    is_readonly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否只读',
    },
    default_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '默认值',
    },
    validation_rule: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '验证规则',
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
  },
  {
    sequelize,
    tableName: 'system_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['key'],
        unique: true,
        name: 'idx_system_configs_key',
      },
      {
        fields: ['category'],
        name: 'idx_system_configs_category',
      },
      {
        fields: ['is_public'],
        name: 'idx_system_configs_public',
      },
    ],
  }
);

export default SystemConfig;