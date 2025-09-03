import express, { Request, Response } from 'express';
import StudentInfoController from '../controller/StudentInfoController';
import { StudentInfo } from '../models/StudentInfoModel';
import Logger from '../utils/logger';
import { PaginatedApiResponse, ApiResponse } from '../types';

const router = express.Router();

// 获取学生列表（支持查询参数）
router.get('/', async (req: Request, res: Response<PaginatedApiResponse<StudentInfo>>) => {
  const clientIP = Logger.getClientIP(req);

  try {
    const {
      classId,
      grade,
      keyword,
      page = '1',
      pageSize = '20'
    } = req.query;

    const params = {
      classId: classId ? parseInt(classId as string, 10) : undefined,
      grade: grade as string,
      keyword: keyword as string,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10)
    };

    const result = await StudentInfoController.getAllStudents(params);

    Logger.info(`获取学生列表`, {
      params,
      total: result.total,
      ip: clientIP,
      action: 'get_students_list'
    });

    res.status(200).json({
      code: 0,
      message: 'Success',
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`获取学生列表失败: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    res.status(500).json({
      code: -1,
      message: error.message,
      data: null,
      pagination: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 根据ID获取学生信息
router.get('/:studentId', async (req: Request<{ studentId: string }>, res: Response<ApiResponse<StudentInfo>>) => {
  const { studentId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(studentId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的学生ID: ${studentId}`, { studentId, ip: clientIP, action: 'invalid_student_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid student ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const student = await StudentInfoController.getStudentById(id);
    if (!student) {
      Logger.warn(`学生未找到: ${studentId}`, { studentId, ip: clientIP, action: 'student_not_found' });
      return res.status(404).json({
        code: -1,
        message: 'Student not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`获取学生信息成功`, {
      studentId: id,
      studentName: student.StuName,
      ip: clientIP,
      action: 'get_student_by_id'
    });

    res.status(200).json({
      code: 0,
      message: 'Success',
      data: student,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`获取学生信息失败: ${error.message}`, {
      studentId,
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    res.status(500).json({
      code: -1,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 创建学生信息（单个或批量）
router.post('/', async (req: Request, res: Response<ApiResponse<StudentInfo | StudentInfo[]>>) => {
  const clientIP = Logger.getClientIP(req);

  try {
    const data = req.body;

    // 检查是否为批量创建
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({
          code: -1,
          message: 'Empty student list',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      const students = await StudentInfoController.createStudentsBulk(data);

      Logger.info(`批量创建学生成功`, {
        count: students.length,
        ip: clientIP,
        action: 'bulk_create_students'
      });

      res.status(201).json({
        code: 0,
        message: 'Students created successfully',
        data: students,
        timestamp: new Date().toISOString()
      });
    } else {
      // 单个创建
      const student = await StudentInfoController.createStudent(data);

      Logger.info(`创建学生成功`, {
        studentId: student.id,
        studentName: student.StuName,
        ip: clientIP,
        action: 'create_student'
      });

      res.status(201).json({
        code: 0,
        message: 'Student created successfully',
        data: student,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    Logger.error(`创建学生失败: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    res.status(500).json({
      code: -1,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 更新学生信息
router.put('/:studentId', async (req: Request<{ studentId: string }>, res: Response<ApiResponse<StudentInfo>>) => {
  const { studentId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(studentId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的学生ID: ${studentId}`, { studentId, ip: clientIP, action: 'invalid_student_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid student ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const updatedStudent = await StudentInfoController.updateStudent(id, req.body);
    if (!updatedStudent) {
      Logger.warn(`学生未找到或更新失败: ${studentId}`, { studentId, ip: clientIP, action: 'student_update_failed' });
      return res.status(404).json({
        code: -1,
        message: 'Student not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`更新学生信息成功`, {
      studentId: id,
      studentName: updatedStudent.StuName,
      ip: clientIP,
      action: 'update_student'
    });

    res.status(200).json({
      code: 0,
      message: 'Student updated successfully',
      data: updatedStudent,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`更新学生信息失败: ${error.message}`, {
      studentId,
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    res.status(500).json({
      code: -1,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 删除学生信息（软删）
router.delete('/:studentId', async (req: Request<{ studentId: string }>, res: Response<ApiResponse<null>>) => {
  const { studentId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(studentId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的学生ID: ${studentId}`, { studentId, ip: clientIP, action: 'invalid_student_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid student ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await StudentInfoController.deleteStudent(id);
    if (!deleted) {
      Logger.warn(`学生未找到或删除失败: ${studentId}`, { studentId, ip: clientIP, action: 'student_delete_failed' });
      return res.status(404).json({
        code: -1,
        message: 'Student not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`删除学生成功`, {
      studentId: id,
      ip: clientIP,
      action: 'delete_student'
    });

    res.status(200).json({
      code: 0,
      message: 'Student deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`删除学生失败: ${error.message}`, {
      studentId,
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    res.status(500).json({
      code: -1,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;