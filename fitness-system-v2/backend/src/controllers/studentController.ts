import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';
import { ResponseUtils, ValidationUtils } from '../utils/helpers';
import logger from '../utils/logger';

export class StudentController {
  /**
   * 创建学生
   */
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const { StuRegisterNumber, StuName, StuGender, StuNation, StuBirth, classID } = req.body;

      // 参数验证
      if (!StuRegisterNumber || !StuName || !StuGender || !StuBirth || !classID) {
        res.status(400).json(ResponseUtils.error('STUDENT_MISSING_REQUIRED_FIELDS', '学籍号、姓名、性别、生日和班级ID不能为空'));
        return;
      }

      // 创建学生
      const student = await StudentService.createStudent({
        StuRegisterNumber,
        StuName,
        StuGender,
        StuNation: StuNation || 1, // 默认汉族
        StuBirth,
        classID
      });

      res.status(201).json(ResponseUtils.success(student, '学生创建成功'));
    } catch (error: any) {
      logger.error('Create student error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_CREATE_FAILED', error.message || '创建学生失败'));
    }
  }

  /**
   * 根据班级获取学生列表
   */
  static async getStudentsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classID } = req.params;
      const {
        page = 1,
        limit = 20,
        search
      } = req.query;

      const classIdNum = parseInt(classID, 10);
      if (isNaN(classIdNum)) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_CLASS_ID', '无效的班级ID'));
        return;
      }

      // 参数验证
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_PAGE', '页码必须是大于0的整数'));
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_LIMIT', '每页数量必须是1-100之间的整数'));
        return;
      }

      // 权限检查：班级账号只能查看自己班级的学生
      if (req.user?.role === 'class' && req.user.className) {
        // 这里可以根据需要添加更严格的班级权限检查
      }

      const result = await StudentService.getStudentsByClass(classIdNum, {
        page: pageNum,
        limit: limitNum,
        search: search as string
      });

      res.json(ResponseUtils.paginated(result.students, result.total, pageNum, limitNum));
    } catch (error: any) {
      logger.error('Get students by class error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_GET_BY_CLASS_FAILED', '获取班级学生列表失败'));
    }
  }

  /**
   * 根据学籍号获取学生信息
   */
  static async getStudentByRegisterNumber(req: Request, res: Response): Promise<void> {
    try {
      const { registerNumber } = req.params;

      if (!registerNumber) {
        res.status(400).json(ResponseUtils.error('STUDENT_MISSING_REGISTER_NUMBER', '学籍号不能为空'));
        return;
      }

      const student = await StudentService.findByRegisterNumber(registerNumber);

      if (!student) {
        res.status(404).json(ResponseUtils.error('STUDENT_NOT_FOUND', '学生不存在'));
        return;
      }

      res.json(ResponseUtils.success(student, '获取学生信息成功'));
    } catch (error: any) {
      logger.error('Get student by register number error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_GET_BY_REGISTER_NUMBER_FAILED', '获取学生信息失败'));
    }
  }

  /**
   * 获取学生详细信息（包含体测数据）
   */
  static async getStudentDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { year } = req.query;

      const studentId = parseInt(id, 10);
      if (isNaN(studentId)) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_ID', '无效的学生ID'));
        return;
      }

      const yearNum = year ? parseInt(year as string, 10) : undefined;

      const detail = await StudentService.getStudentDetail(studentId, yearNum);

      res.json(ResponseUtils.success(detail, '获取学生详情成功'));
    } catch (error: any) {
      logger.error('Get student detail error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_GET_DETAIL_FAILED', error.message || '获取学生详情失败'));
    }
  }

  /**
   * 更新学生信息
   */
  static async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { StuName, StuGender, StuNation, StuBirth, classID } = req.body;

      const studentId = parseInt(id, 10);
      if (isNaN(studentId)) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_ID', '无效的学生ID'));
        return;
      }

      const updatedStudent = await StudentService.updateStudent(studentId, {
        StuName,
        StuGender,
        StuNation,
        StuBirth,
        classID
      });

      res.json(ResponseUtils.success(updatedStudent, '学生信息更新成功'));
    } catch (error: any) {
      logger.error('Update student error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_UPDATE_FAILED', error.message || '更新学生失败'));
    }
  }

  /**
   * 删除学生
   */
  static async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const studentId = parseInt(id, 10);
      if (isNaN(studentId)) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_ID', '无效的学生ID'));
        return;
      }

      const success = await StudentService.deleteStudent(studentId);

      if (!success) {
        res.status(404).json(ResponseUtils.error('STUDENT_NOT_FOUND', '学生不存在'));
        return;
      }

      res.json(ResponseUtils.success(null, '学生删除成功'));
    } catch (error: any) {
      logger.error('Delete student error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_DELETE_FAILED', error.message || '删除学生失败'));
    }
  }

  /**
   * 批量导入学生
   */
  static async batchImportStudents(req: Request, res: Response): Promise<void> {
    try {
      const { students } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_BATCH_DATA', '批量数据格式不正确'));
        return;
      }

      // 验证数据格式
      for (const student of students) {
        if (!student.StuRegisterNumber || !student.StuName || !student.StuGender || !student.StuBirth || !student.className) {
          res.status(400).json(ResponseUtils.error('STUDENT_INVALID_BATCH_DATA', '学生数据缺少必要字段'));
          return;
        }

        if (!ValidationUtils.isValidStudentNumber(student.StuRegisterNumber)) {
          res.status(400).json(ResponseUtils.error('STUDENT_INVALID_REGISTER_NUMBER', `学籍号格式不正确: ${student.StuRegisterNumber}`));
          return;
        }

        if (!ValidationUtils.isValidGender(student.StuGender)) {
          res.status(400).json(ResponseUtils.error('STUDENT_INVALID_GENDER', `性别格式不正确: ${student.StuGender}`));
          return;
        }

        if (!ValidationUtils.isValidBirthDate(student.StuBirth)) {
          res.status(400).json(ResponseUtils.error('STUDENT_INVALID_BIRTH_DATE', `生日格式不正确: ${student.StuBirth}`));
          return;
        }
      }

      const results = await StudentService.batchImportStudents(students);

      // 记录批量导入日志
      logger.business('Batch import students', {
        totalCount: students.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        userId: req.user?.userId,
        username: req.user?.username
      });

      res.json(ResponseUtils.success(results, `批量导入完成，成功${results.success.length}个，失败${results.failed.length}个`));
    } catch (error: any) {
      logger.error('Batch import students error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_BATCH_IMPORT_FAILED', '批量导入学生失败'));
    }
  }

  /**
   * 按年级获取学生统计
   */
  static async getStudentStatsByGrade(req: Request, res: Response): Promise<void> {
    try {
      const { grade } = req.params;

      if (!grade) {
        res.status(400).json(ResponseUtils.error('STUDENT_MISSING_GRADE', '年级参数不能为空'));
        return;
      }

      // 这里可以实现按年级获取学生统计的逻辑
      // 暂时返回基础响应
      res.json(ResponseUtils.success({ grade, message: '功能待实现' }, '获取年级学生统计成功'));
    } catch (error: any) {
      logger.error('Get student stats by grade error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_GET_STATS_FAILED', '获取年级学生统计失败'));
    }
  }

  /**
   * 验证学生数据
   */
  static async validateStudentData(req: Request, res: Response): Promise<void> {
    try {
      const { students } = req.body;

      if (!Array.isArray(students)) {
        res.status(400).json(ResponseUtils.error('STUDENT_INVALID_DATA_FORMAT', '数据格式不正确'));
        return;
      }

      const validationResults = students.map((student, index) => {
        const errors: string[] = [];

        // 验证学籍号
        if (!student.StuRegisterNumber) {
          errors.push('学籍号不能为空');
        } else if (!ValidationUtils.isValidStudentNumber(student.StuRegisterNumber)) {
          errors.push('学籍号格式不正确');
        }

        // 验证姓名
        if (!student.StuName || student.StuName.trim().length === 0) {
          errors.push('姓名不能为空');
        }

        // 验证性别
        if (!student.StuGender) {
          errors.push('性别不能为空');
        } else if (!ValidationUtils.isValidGender(student.StuGender)) {
          errors.push('性别格式不正确（应为0或1）');
        }

        // 验证生日
        if (!student.StuBirth) {
          errors.push('生日不能为空');
        } else if (!ValidationUtils.isValidBirthDate(student.StuBirth)) {
          errors.push('生日格式不正确');
        }

        // 验证班级名称
        if (!student.className) {
          errors.push('班级名称不能为空');
        }

        return {
          row: index + 1,
          student,
          valid: errors.length === 0,
          errors
        };
      });

      const validCount = validationResults.filter(r => r.valid).length;
      const invalidCount = validationResults.length - validCount;

      res.json(ResponseUtils.success({
        totalCount: students.length,
        validCount,
        invalidCount,
        results: validationResults
      }, '学生数据验证完成'));
    } catch (error: any) {
      logger.error('Validate student data error:', error);
      res.status(500).json(ResponseUtils.error('STUDENT_VALIDATE_FAILED', '验证学生数据失败'));
    }
  }
}

export default StudentController;