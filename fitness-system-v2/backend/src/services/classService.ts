import ClassInfo from '../models/ClassInfo';
import Student from '../models/Student';
import SportData from '../models/SportData';
import { ValidationUtils } from '../utils/helpers';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class ClassService {
  /**
   * 创建班级
   */
  static async createClass(classData: {
    classID: number;
    className: string;
    grade?: string;
    department?: string;
    academicYear: number;
  }): Promise<ClassInfo> {
    try {
      // 验证班级名称
      if (!ValidationUtils.isValidClassName(classData.className)) {
        throw new Error('班级名称格式不正确');
      }

      // 检查班级ID是否已存在
      const existingClass = await ClassInfo.findOne({
        where: { classID: classData.classID }
      });

      if (existingClass) {
        throw new Error('班级ID已存在');
      }

      // 创建班级
      const classInfo = await ClassInfo.create(classData);

      logger.business('Class created', {
        classID: classInfo.classID,
        className: classInfo.className,
        academicYear: classInfo.academicYear
      });

      return classInfo;
    } catch (error: any) {
      logger.error('Error creating class:', error);
      throw new Error(error.message || '创建班级失败');
    }
  }

  /**
   * 获取班级列表
   */
  static async getClasses(params: {
    page?: number;
    limit?: number;
    grade?: string;
    academicYear?: number;
    search?: string;
  } = {}): Promise<{ classes: ClassInfo[], total: number }> {
    try {
      const { page = 1, limit = 20, grade, academicYear, search } = params;
      const offset = (page - 1) * limit;

      const whereClause: any = {
        is_deleted: false
      };

      if (grade) {
        whereClause.grade = grade;
      }

      if (academicYear) {
        whereClause.academicYear = academicYear;
      }

      if (search) {
        whereClause[Op.or] = [
          { className: { [Op.like]: `%${search}%` } },
          { department: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows: classes, count: total } = await ClassInfo.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['academicYear', 'DESC'], ['className', 'ASC']]
      });

      return { classes, total };
    } catch (error) {
      logger.error('Error getting classes:', error);
      throw new Error('获取班级列表失败');
    }
  }

  /**
   * 根据班级ID获取班级详情
   */
  static async getClassById(classID: number): Promise<ClassInfo | null> {
    try {
      const classInfo = await ClassInfo.findOne({
        where: { classID, is_deleted: false }
      });
      return classInfo;
    } catch (error) {
      logger.error('Error getting class by ID:', error);
      throw new Error('获取班级详情失败');
    }
  }

  /**
   * 根据班级名称获取班级
   */
  static async getClassByName(className: string): Promise<ClassInfo | null> {
    try {
      const classInfo = await ClassInfo.findOne({
        where: { className, is_deleted: false }
      });
      return classInfo;
    } catch (error) {
      logger.error('Error getting class by name:', error);
      throw new Error('根据名称获取班级失败');
    }
  }

  /**
   * 更新班级信息
   */
  static async updateClass(
    classID: number,
    updateData: Partial<{
      className: string;
      grade: string;
      department: string;
      academicYear: number;
    }>
  ): Promise<ClassInfo> {
    try {
      const classInfo = await ClassInfo.findOne({
        where: { classID, is_deleted: false }
      });

      if (!classInfo) {
        throw new Error('班级不存在');
      }

      // 验证班级名称
      if (updateData.className && !ValidationUtils.isValidClassName(updateData.className)) {
        throw new Error('班级名称格式不正确');
      }

      // 更新班级信息
      await classInfo.update(updateData);

      logger.business('Class updated', {
        classID,
        updateData
      });

      return classInfo;
    } catch (error: any) {
      logger.error('Error updating class:', error);
      throw new Error(error.message || '更新班级失败');
    }
  }

  /**
   * 软删除班级
   */
  static async deleteClass(classID: number): Promise<boolean> {
    try {
      const classInfo = await ClassInfo.findOne({
        where: { classID, is_deleted: false }
      });

      if (!classInfo) {
        throw new Error('班级不存在');
      }

      // 检查是否有学生在该班级
      const studentCount = await Student.count({
        where: { classID, is_deleted: false }
      });

      if (studentCount > 0) {
        throw new Error('班级中还有学生，无法删除');
      }

      // 软删除班级
      await classInfo.update({
        is_deleted: true,
        deleted_at: new Date()
      });

      logger.business('Class deleted', {
        classID,
        className: classInfo.className
      });

      return true;
    } catch (error: any) {
      logger.error('Error deleting class:', error);
      throw new Error(error.message || '删除班级失败');
    }
  }

  /**
   * 获取班级学生统计
   */
  static async getClassStats(classID: number): Promise<{
    totalStudents: number;
    maleCount: number;
    femaleCount: number;
    currentYearTestData: {
      year: number;
      hasDataCount: number;
      avgScore: number;
      passRate: number;
    } | null;
  }> {
    try {
      const classInfo = await ClassInfo.findOne({
        where: { classID, is_deleted: false }
      });

      if (!classInfo) {
        throw new Error('班级不存在');
      }

      // 获取班级学生统计
      const totalStudents = await Student.count({
        where: { classID, is_deleted: false }
      });

      const maleCount = await Student.count({
        where: { classID, StuGender: '1', is_deleted: false }
      });

      const femaleCount = await Student.count({
        where: { classID, StuGender: '0', is_deleted: false }
      });

      // 获取当前年度体测数据统计
      const currentYear = new Date().getFullYear();
      const sportDataList = await SportData.findAll({
        where: { classID, year: currentYear },
        include: [
          {
            model: Student,
            where: { is_deleted: false }
          }
        ]
      });

      let currentYearTestData = null;
      if (sportDataList.length > 0) {
        const scores = sportDataList
          .filter(data => data.totalScore !== null && data.totalScore !== undefined)
          .map(data => data.totalScore!);

        const avgScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        const passCount = scores.filter(score => score >= 60).length;
        const passRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;

        currentYearTestData = {
          year: currentYear,
          hasDataCount: sportDataList.length,
          avgScore,
          passRate
        };
      }

      return {
        totalStudents,
        maleCount,
        femaleCount,
        currentYearTestData
      };
    } catch (error: any) {
      logger.error('Error getting class stats:', error);
      throw new Error(error.message || '获取班级统计失败');
    }
  }

  /**
   * 获取年级列表
   */
  static async getGrades(): Promise<string[]> {
    try {
      const grades = await ClassInfo.findAll({
        where: { is_deleted: false },
        attributes: ['grade'],
        group: ['grade'],
        order: [['grade', 'DESC']]
      });

      return grades
        .map(g => g.grade)
        .filter(grade => grade !== null && grade !== undefined) as string[];
    } catch (error) {
      logger.error('Error getting grades:', error);
      throw new Error('获取年级列表失败');
    }
  }

  /**
   * 获取学年列表
   */
  static async getAcademicYears(): Promise<number[]> {
    try {
      const years = await ClassInfo.findAll({
        where: { is_deleted: false },
        attributes: ['academicYear'],
        group: ['academicYear'],
        order: [['academicYear', 'DESC']]
      });

      return years.map(y => y.academicYear);
    } catch (error) {
      logger.error('Error getting academic years:', error);
      throw new Error('获取学年列表失败');
    }
  }

  /**
   * 根据年级获取班级
   */
  static async getClassesByGrade(grade: string): Promise<ClassInfo[]> {
    try {
      const classes = await ClassInfo.findAll({
        where: { 
          grade, 
          is_deleted: false 
        },
        order: [['className', 'ASC']]
      });

      return classes;
    } catch (error) {
      logger.error('Error getting classes by grade:', error);
      throw new Error('获取年级班级失败');
    }
  }

  /**
   * 批量创建班级
   */
  static async batchCreateClasses(
    classesData: Array<{
      classID: number;
      className: string;
      grade?: string;
      department?: string;
      academicYear: number;
    }>
  ): Promise<{ success: ClassInfo[], failed: Array<{ data: any, error: string }> }> {
    const success: ClassInfo[] = [];
    const failed: Array<{ data: any, error: string }> = [];

    for (const classData of classesData) {
      try {
        const classInfo = await this.createClass(classData);
        success.push(classInfo);
      } catch (error: any) {
        failed.push({
          data: classData,
          error: error.message
        });
      }
    }

    logger.business('Batch create classes completed', {
      successCount: success.length,
      failedCount: failed.length
    });

    return { success, failed };
  }
}

export default ClassService;