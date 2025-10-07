import Student from '../models/Student';
import ClassInfo from '../models/ClassInfo';
import SportData from '../models/SportData';
import { ValidationUtils, FormatUtils } from '../utils/helpers';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class StudentService {
  /**
   * 根据学籍号查找学生
   */
  static async findByRegisterNumber(stuRegisterNumber: string): Promise<Student | null> {
    try {
      const student = await Student.findOne({
        where: { 
          StuRegisterNumber: stuRegisterNumber,
          is_deleted: false 
        },
        include: [
          {
            model: ClassInfo,
            required: false
          }
        ]
      });
      return student;
    } catch (error) {
      logger.error('Error finding student by register number:', error);
      throw new Error('查找学生失败');
    }
  }

  /**
   * 根据班级ID获取学生列表
   */
  static async getStudentsByClass(
    classID: number, 
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{ students: Student[], total: number }> {
    try {
      const { page = 1, limit = 20, search } = params;
      const offset = (page - 1) * limit;

      const whereClause: any = {
        classID,
        is_deleted: false
      };

      if (search) {
        whereClause[Op.or] = [
          { StuName: { [Op.like]: `%${search}%` } },
          { StuRegisterNumber: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows: students, count: total } = await Student.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ClassInfo,
            required: false
          }
        ],
        limit,
        offset,
        order: [['StuName', 'ASC']]
      });

      return { students, total };
    } catch (error) {
      logger.error('Error getting students by class:', error);
      throw new Error('获取学生列表失败');
    }
  }

  /**
   * 创建新学生
   */
  static async createStudent(studentData: {
    StuRegisterNumber: string;
    StuName: string;
    StuGender: '0' | '1';
    StuNation: number;
    StuBirth: string;
    classID: number;
  }): Promise<Student> {
    try {
      // 验证学籍号格式
      if (!ValidationUtils.isValidStudentNumber(studentData.StuRegisterNumber)) {
        throw new Error('学籍号格式不正确');
      }

      // 验证性别
      if (!ValidationUtils.isValidGender(studentData.StuGender)) {
        throw new Error('性别格式不正确');
      }

      // 验证生日
      if (!ValidationUtils.isValidBirthDate(studentData.StuBirth)) {
        throw new Error('生日格式不正确');
      }

      // 检查学籍号是否已存在
      const existingStudent = await Student.findOne({
        where: { StuRegisterNumber: studentData.StuRegisterNumber }
      });

      if (existingStudent) {
        throw new Error('学籍号已存在');
      }

      // 验证班级是否存在
      const classInfo = await ClassInfo.findOne({
        where: { classID: studentData.classID }
      });

      if (!classInfo) {
        throw new Error('班级不存在');
      }

      // 创建学生
      const student = await Student.create(studentData);

      logger.business('Student created', {
        studentId: student.id,
        stuRegisterNumber: student.StuRegisterNumber,
        stuName: student.StuName,
        classID: student.classID
      });

      return student;
    } catch (error: any) {
      logger.error('Error creating student:', error);
      throw new Error(error.message || '创建学生失败');
    }
  }

  /**
   * 更新学生信息
   */
  static async updateStudent(
    id: number, 
    updateData: Partial<{
      StuName: string;
      StuGender: '0' | '1';
      StuNation: number;
      StuBirth: string;
      classID: number;
    }>
  ): Promise<Student> {
    try {
      const student = await Student.findOne({
        where: { id, is_deleted: false }
      });

      if (!student) {
        throw new Error('学生不存在');
      }

      // 验证更新数据
      if (updateData.StuGender && !ValidationUtils.isValidGender(updateData.StuGender)) {
        throw new Error('性别格式不正确');
      }

      if (updateData.StuBirth && !ValidationUtils.isValidBirthDate(updateData.StuBirth)) {
        throw new Error('生日格式不正确');
      }

      if (updateData.classID) {
        const classInfo = await ClassInfo.findOne({
          where: { classID: updateData.classID }
        });
        if (!classInfo) {
          throw new Error('班级不存在');
        }
      }

      // 更新学生信息
      await student.update(updateData);

      logger.business('Student updated', {
        studentId: student.id,
        updateData
      });

      return student;
    } catch (error: any) {
      logger.error('Error updating student:', error);
      throw new Error(error.message || '更新学生失败');
    }
  }

  /**
   * 软删除学生
   */
  static async deleteStudent(id: number): Promise<boolean> {
    try {
      const student = await Student.findOne({
        where: { id, is_deleted: false }
      });

      if (!student) {
        throw new Error('学生不存在');
      }

      // 软删除
      await student.update({
        is_deleted: true,
        deleted_at: new Date()
      });

      logger.business('Student deleted', {
        studentId: student.id,
        stuRegisterNumber: student.StuRegisterNumber
      });

      return true;
    } catch (error: any) {
      logger.error('Error deleting student:', error);
      throw new Error(error.message || '删除学生失败');
    }
  }

  /**
   * 获取学生详细信息（包含体测数据）
   */
  static async getStudentDetail(id: number, year?: number): Promise<any> {
    try {
      const student = await Student.findOne({
        where: { id, is_deleted: false },
        include: [
          {
            model: ClassInfo,
            required: false
          }
        ]
      });

      if (!student) {
        throw new Error('学生不存在');
      }

      // 获取体测数据
      const whereClause: any = { studentID: id };
      if (year) {
        whereClause.year = year;
      }

      const sportDataList = await SportData.findAll({
        where: whereClause,
        order: [['year', 'DESC']]
      });

      // 格式化数据
      const currentYearData = year 
        ? sportDataList.find(data => data.year === year)
        : sportDataList[0];

      return {
        student: FormatUtils.formatUser(student),
        currentYear: currentYearData ? FormatUtils.formatStudentScore(student, currentYearData) : null,
        history: sportDataList.map(data => ({
          year: data.year,
          totalScore: data.totalScore,
          classRank: data.classRank,
          gradeRank: data.gradeRank
        }))
      };
    } catch (error: any) {
      logger.error('Error getting student detail:', error);
      throw new Error(error.message || '获取学生详情失败');
    }
  }

  /**
   * 批量导入学生数据
   */
  static async batchImportStudents(
    studentsData: Array<{
      StuRegisterNumber: string;
      StuName: string;
      StuGender: '0' | '1';
      StuNation: number;
      StuBirth: string;
      className: string;
    }>
  ): Promise<{ success: Student[], failed: Array<{ data: any, error: string }> }> {
    const success: Student[] = [];
    const failed: Array<{ data: any, error: string }> = [];

    for (const studentData of studentsData) {
      try {
        // 根据班级名查找班级ID
        const classInfo = await ClassInfo.findOne({
          where: { className: studentData.className }
        });

        if (!classInfo) {
          failed.push({
            data: studentData,
            error: `班级不存在: ${studentData.className}`
          });
          continue;
        }

        const student = await this.createStudent({
          ...studentData,
          classID: classInfo.classID
        });

        success.push(student);
      } catch (error: any) {
        failed.push({
          data: studentData,
          error: error.message
        });
      }
    }

    logger.business('Batch import students completed', {
      successCount: success.length,
      failedCount: failed.length
    });

    return { success, failed };
  }
}

export default StudentService;