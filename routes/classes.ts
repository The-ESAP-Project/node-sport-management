import express, { Request, Response } from 'express';
import ClassInfoController from '../controller/ClassInfoController';
import { ClassInfo } from '../models/ClassInfoModel';
import Logger from '../utils/logger';
import { ApiResponse } from '../types/api';

const router = express.Router();

// 根据学年获取班级信息
router.get('/year/:academicYear', async (req: Request<{ academicYear: string }>, res: Response<ApiResponse<ClassInfo[]>>) => {
  const { academicYear } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const year = parseInt(academicYear, 10);
    if (isNaN(year)) {
      Logger.warn(`无效的学年: ${academicYear}`, { academicYear, ip: clientIP, action: 'invalid_academic_year' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid academic year',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const classes = await ClassInfoController.getClassesByAcademicYear(year);

    Logger.info(`获取学年班级列表`, {
      academicYear: year,
      count: classes.length,
      ip: clientIP,
      action: 'get_classes_by_year'
    });

    res.status(200).json({
      code: 0,
      message: 'Success',
      data: classes,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`获取学年班级列表失败: ${error.message}`, {
      academicYear,
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

// 获取所有班级信息
router.get('/', async (req: Request, res: Response<ApiResponse<ClassInfo[]>>) => {
  const clientIP = Logger.getClientIP(req);

  try {
    const classes = await ClassInfoController.getAllClasses();

    Logger.info(`获取班级列表`, {
      count: classes.length,
      ip: clientIP,
      action: 'get_classes_list'
    });

    res.status(200).json({
      code: 0,
      message: 'Success',
      data: classes,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`获取班级列表失败: ${error.message}`, {
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

// 根据ID获取班级信息
router.get('/:classId', async (req: Request<{ classId: string }>, res: Response<ApiResponse<ClassInfo>>) => {
  const { classId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(classId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的班级ID: ${classId}`, { classId, ip: clientIP, action: 'invalid_class_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid class ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const classInfo = await ClassInfoController.getClassById(id);
    if (!classInfo) {
      Logger.warn(`班级未找到: ${classId}`, { classId, ip: clientIP, action: 'class_not_found' });
      return res.status(404).json({
        code: -1,
        message: 'Class not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`获取班级信息成功`, {
      classId: id,
      className: classInfo.className,
      ip: clientIP,
      action: 'get_class_by_id'
    });

    res.status(200).json({
      code: 0,
      message: 'Success',
      data: classInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`获取班级信息失败: ${error.message}`, {
      classId,
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

// 创建班级信息
router.post('/', async (req: Request<{}, ApiResponse<ClassInfo>, Omit<ClassInfo, 'id' | 'isDeleted' | 'deletedAt'>>, res: Response<ApiResponse<ClassInfo>>) => {
  const clientIP = Logger.getClientIP(req);

  try {
    const { academicYear, classID, className } = req.body;

    // 验证必需字段
    if (!academicYear || !classID || !className) {
      Logger.warn(`创建班级缺少必需字段`, {
        hasAcademicYear: !!academicYear,
        hasClassID: !!classID,
        hasClassName: !!className,
        ip: clientIP,
        action: 'create_class_missing_fields'
      });
      return res.status(400).json({
        code: -1,
        message: 'Missing required fields: academicYear, classID, className',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证学年格式
    if (typeof academicYear !== 'number' || academicYear < 2000 || academicYear > 2100) {
      Logger.warn(`无效的学年: ${academicYear}`, {
        academicYear,
        ip: clientIP,
        action: 'invalid_academic_year'
      });
      return res.status(400).json({
        code: -1,
        message: 'Invalid academic year (must be between 2000-2100)',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 检查是否已存在相同学年的相同班级
    const existingClass = await ClassInfoController.getClassByClassIdAndYear(classID, academicYear);
    if (existingClass) {
      Logger.warn(`班级已存在: ${academicYear}学年 ${classID}`, {
        academicYear,
        classID,
        ip: clientIP,
        action: 'class_already_exists'
      });
      return res.status(409).json({
        code: -1,
        message: 'Class already exists for this academic year',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const classInfo = await ClassInfoController.createClass(req.body);

    Logger.info(`创建班级成功`, {
      classId: classInfo.id,
      className: classInfo.className,
      academicYear: classInfo.academicYear,
      ip: clientIP,
      action: 'create_class'
    });

    res.status(201).json({
      code: 0,
      message: 'Class created successfully',
      data: classInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`创建班级失败: ${error.message}`, {
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

// 更新班级信息
router.put('/:classId', async (req: Request<{ classId: string }, ApiResponse<ClassInfo>, Partial<Omit<ClassInfo, 'id' | 'isDeleted' | 'deletedAt'>>>, res: Response<ApiResponse<ClassInfo>>) => {
  const { classId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(classId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的班级ID: ${classId}`, { classId, ip: clientIP, action: 'invalid_class_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid class ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const updatedClass = await ClassInfoController.updateClass(id, req.body);
    if (!updatedClass) {
      Logger.warn(`班级未找到或更新失败: ${classId}`, { classId, ip: clientIP, action: 'class_update_failed' });
      return res.status(404).json({
        code: -1,
        message: 'Class not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`更新班级信息成功`, {
      classId: id,
      className: updatedClass.className,
      ip: clientIP,
      action: 'update_class'
    });

    res.status(200).json({
      code: 0,
      message: 'Class updated successfully',
      data: updatedClass,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`更新班级信息失败: ${error.message}`, {
      classId,
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

// 删除班级信息（软删）
router.delete('/:classId', async (req: Request<{ classId: string }>, res: Response<ApiResponse<null>>) => {
  const { classId } = req.params;
  const clientIP = Logger.getClientIP(req);

  try {
    const id = parseInt(classId, 10);
    if (isNaN(id)) {
      Logger.warn(`无效的班级ID: ${classId}`, { classId, ip: clientIP, action: 'invalid_class_id' });
      return res.status(400).json({
        code: -1,
        message: 'Invalid class ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await ClassInfoController.deleteClass(id);
    if (!deleted) {
      Logger.warn(`班级未找到或删除失败: ${classId}`, { classId, ip: clientIP, action: 'class_delete_failed' });
      return res.status(404).json({
        code: -1,
        message: 'Class not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    Logger.info(`删除班级成功`, {
      classId: id,
      ip: clientIP,
      action: 'delete_class'
    });

    res.status(200).json({
      code: 0,
      message: 'Class deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error(`删除班级失败: ${error.message}`, {
      classId,
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
