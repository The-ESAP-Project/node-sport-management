import { v4 as uuidv4 } from 'uuid';
import { SportItem, Gender } from '../types/enums';

/**
 * 响应工具类
 */
export class ResponseUtils {
  /**
   * 成功响应
   */
  static success<T>(data?: T, message?: string) {
    return {
      success: true,
      data,
      message
    };
  }

  /**
   * 错误响应
   */
  static error(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      }
    };
  }

  /**
   * 分页响应
   */
  static paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }
}

/**
 * 数据格式化工具
 */
export class FormatUtils {
  /**
   * 格式化用户信息（移除敏感字段）
   */
  static formatUser(user: any) {
    const { password, ...safeUser } = user.toJSON ? user.toJSON() : user;
    return safeUser;
  }

  /**
   * 格式化学生成绩数据
   */
  static formatStudentScore(student: any, sportData: any) {
    return {
      studentId: student.id,
      studentName: student.StuName,
      studentGender: student.StuGender,
      classID: student.classID,
      year: sportData.year,
      totalScore: sportData.totalScore,
      classRank: sportData.classRank,
      gradeRank: sportData.gradeRank,
      items: {
        height: sportData.height,
        weight: sportData.weight,
        vitalCapacity: sportData.vitalCapacity,
        fiftyRun: sportData.fiftyRun,
        standingLongJump: sportData.standingLongJump,
        sitAndReach: sportData.sitAndReach,
        eightHundredRun: sportData.eightHundredRun,
        oneThousandRun: sportData.oneThousandRun,
        sitUp: sportData.sitUp,
        pullUp: sportData.pullUp
      },
      updatedAt: sportData.updated_at
    };
  }

  /**
   * 获取体测项目中文名称
   */
  static getItemName(item: SportItem): string {
    const itemNames: Record<SportItem, string> = {
      [SportItem.HEIGHT]: '身高',
      [SportItem.WEIGHT]: '体重',
      [SportItem.VITAL_CAPACITY]: '肺活量',
      [SportItem.FIFTY_RUN]: '50米跑',
      [SportItem.STANDING_LONG_JUMP]: '立定跳远',
      [SportItem.SIT_AND_REACH]: '坐位体前屈',
      [SportItem.EIGHT_HUNDRED_RUN]: '800米跑',
      [SportItem.ONE_THOUSAND_RUN]: '1000米跑',
      [SportItem.SIT_UP]: '1分钟仰卧起坐',
      [SportItem.PULL_UP]: '引体向上'
    };
    return itemNames[item] || item;
  }

  /**
   * 获取性别中文名称
   */
  static getGenderName(gender: '0' | '1'): string {
    return gender === '1' ? '男' : '女';
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 格式化时间戳
   */
  static formatDateTime(date: Date): string {
    return date.toISOString();
  }
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 验证班级名称格式
   */
  static isValidClassName(className: string): boolean {
    // 基本格式验证：不为空，长度合理
    return typeof className === 'string' && 
           className.trim().length > 0 && 
           className.length <= 50;
  }

  /**
   * 验证年级格式
   */
  static isValidGrade(grade: string): boolean {
    // 支持数字年级：2020, 2021等
    return /^\d{4}$/.test(grade);
  }

  /**
   * 验证用户名格式（班级账号）
   */
  static isValidClassUsername(username: string): boolean {
    // 格式：年级-班级名
    return /^\d{4}-.+$/.test(username);
  }

  /**
   * 解析班级用户名
   */
  static parseClassUsername(username: string): { grade: string; className: string } | null {
    const match = username.match(/^(\d{4})-(.+)$/);
    if (!match) return null;
    
    return {
      grade: match[1],
      className: match[2]
    };
  }

  /**
   * 验证性别格式
   */
  static isValidGender(gender: string): boolean {
    return gender === '0' || gender === '1';
  }

  /**
   * 验证学籍号格式
   */
  static isValidStudentNumber(stuRegisterNumber: string): boolean {
    // 基本格式验证：不为空，长度合理（通常10-20位）
    return typeof stuRegisterNumber === 'string' && 
           stuRegisterNumber.trim().length > 0 && 
           stuRegisterNumber.length >= 10 &&
           stuRegisterNumber.length <= 20;
  }

  /**
   * 验证体测数据范围
   */
  static validateSportData(item: SportItem, value: number, gender: '0' | '1'): boolean {
    const ranges: Record<SportItem, { min: number; max: number }> = {
      [SportItem.HEIGHT]: { min: 120, max: 220 },
      [SportItem.WEIGHT]: { min: 25, max: 200 },
      [SportItem.VITAL_CAPACITY]: { min: 500, max: 8000 },
      [SportItem.FIFTY_RUN]: { min: 5, max: 20 },
      [SportItem.STANDING_LONG_JUMP]: { min: 50, max: 350 }, // 单位cm
      [SportItem.SIT_AND_REACH]: { min: -10, max: 35 },
      [SportItem.EIGHT_HUNDRED_RUN]: { min: 120, max: 800 },
      [SportItem.ONE_THOUSAND_RUN]: { min: 150, max: 1000 },
      [SportItem.SIT_UP]: { min: 0, max: 100 },
      [SportItem.PULL_UP]: { min: 0, max: 50 }
    };

    const range = ranges[item];
    return value >= range.min && value <= range.max;
  }

  /**
   * 验证生日格式
   */
  static isValidBirthDate(birthDate: string): boolean {
    // YYYY-MM-DD格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) return false;
    
    const date = new Date(birthDate);
    const now = new Date();
    
    // 检查日期是否有效，且在合理范围内（5-30岁）
    const age = now.getFullYear() - date.getFullYear();
    return date instanceof Date && !isNaN(date.getTime()) && age >= 5 && age <= 30;
  }
}

/**
 * 通用工具类
 */
export class CommonUtils {
  /**
   * 生成唯一ID
   */
  static generateId(): string {
    return uuidv4();
  }

  /**
   * 睡眠函数
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 数组分块
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 移除对象中的空值
   */
  static removeEmptyValues(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * 安全的JSON解析
   */
  static safeJsonParse<T>(str: string, defaultValue: T): T {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }

  /**
   * 计算百分位数
   */
  static calculatePercentile(value: number, values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sorted.length) * 100;
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 转换性别格式：从字符串到数字
   */
  static convertGenderToCode(gender: string): '0' | '1' | null {
    if (gender === '男' || gender === 'male' || gender === '1') return '1';
    if (gender === '女' || gender === 'female' || gender === '0') return '0';
    return null;
  }

  /**
   * 转换性别格式：从数字到中文
   */
  static convertGenderToText(gender: '0' | '1'): string {
    return gender === '1' ? '男' : '女';
  }
}

// 导出所有工具类
export default {
  ResponseUtils,
  FormatUtils,
  ValidationUtils,
  CommonUtils
};