import { Request, Response } from 'express';
import { ClassService } from '../services/classService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';

export class ClassController {
  /**
   * 创建班级（仅管理员）
   */
  static async createClass(req: Request, res: Response): Promise<void> {
    try {
      const { classID, className, grade, department, academicYear } = req.body;

      // 参数验证
      if (!classID || !className || !academicYear) {
        res.status(400).json(ResponseUtils.error('CLASS_MISSING_REQUIRED_FIELDS', '班级ID、班级名称和学年不能为空'));
        return;
      }

      // 创建班级
      const classInfo = await ClassService.createClass({
        classID,
        className,
        grade,
        department,
        academicYear
      });

      res.status(201).json(ResponseUtils.success(classInfo, '班级创建成功'));
    } catch (error: any) {
      logger.error('Create class error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_CREATE_FAILED', error.message || '创建班级失败'));
    }
  }

  /**
   * 获取班级列表
   */
  static async getClasses(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        grade,
        academicYear,
        search
      } = req.query;

      // 参数验证
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_PAGE', '页码必须是大于0的整数'));
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_LIMIT', '每页数量必须是1-100之间的整数'));
        return;
      }

      const result = await ClassService.getClasses({
        page: pageNum,
        limit: limitNum,
        grade: grade as string,
        academicYear: academicYear ? parseInt(academicYear as string, 10) : undefined,
        search: search as string
      });

      res.json(ResponseUtils.paginated(result.classes, result.total, pageNum, limitNum));
    } catch (error: any) {
      logger.error('Get classes error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_LIST_FAILED', '获取班级列表失败'));
    }
  }

  /**
   * 根据ID获取班级详情
   */
  static async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classID = parseInt(id, 10);

      if (isNaN(classID)) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_ID', '无效的班级ID'));
        return;
      }

      const classInfo = await ClassService.getClassById(classID);

      if (!classInfo) {
        res.status(404).json(ResponseUtils.error('CLASS_NOT_FOUND', '班级不存在'));
        return;
      }

      res.json(ResponseUtils.success(classInfo, '获取班级详情成功'));
    } catch (error: any) {
      logger.error('Get class by ID error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_DETAIL_FAILED', '获取班级详情失败'));
    }
  }

  /**
   * 更新班级信息（仅管理员）
   */
  static async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { className, grade, department, academicYear } = req.body;
      const classID = parseInt(id, 10);

      if (isNaN(classID)) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_ID', '无效的班级ID'));
        return;
      }

      const updatedClass = await ClassService.updateClass(classID, {
        className,
        grade,
        department,
        academicYear
      });

      res.json(ResponseUtils.success(updatedClass, '班级信息更新成功'));
    } catch (error: any) {
      logger.error('Update class error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_UPDATE_FAILED', error.message || '更新班级失败'));
    }
  }

  /**
   * 删除班级（仅管理员）
   */
  static async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classID = parseInt(id, 10);

      if (isNaN(classID)) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_ID', '无效的班级ID'));
        return;
      }

      const success = await ClassService.deleteClass(classID);

      if (!success) {
        res.status(404).json(ResponseUtils.error('CLASS_NOT_FOUND', '班级不存在'));
        return;
      }

      res.json(ResponseUtils.success(null, '班级删除成功'));
    } catch (error: any) {
      logger.error('Delete class error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_DELETE_FAILED', error.message || '删除班级失败'));
    }
  }

  /**
   * 获取班级统计信息
   */
  static async getClassStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classID = parseInt(id, 10);

      if (isNaN(classID)) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_ID', '无效的班级ID'));
        return;
      }

      const stats = await ClassService.getClassStats(classID);

      res.json(ResponseUtils.success(stats, '获取班级统计成功'));
    } catch (error: any) {
      logger.error('Get class stats error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_STATS_FAILED', error.message || '获取班级统计失败'));
    }
  }

  /**
   * 获取年级列表
   */
  static async getGrades(req: Request, res: Response): Promise<void> {
    try {
      const grades = await ClassService.getGrades();

      res.json(ResponseUtils.success(grades, '获取年级列表成功'));
    } catch (error: any) {
      logger.error('Get grades error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_GRADES_FAILED', '获取年级列表失败'));
    }
  }

  /**
   * 获取学年列表
   */
  static async getAcademicYears(req: Request, res: Response): Promise<void> {
    try {
      const years = await ClassService.getAcademicYears();

      res.json(ResponseUtils.success(years, '获取学年列表成功'));
    } catch (error: any) {
      logger.error('Get academic years error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_ACADEMIC_YEARS_FAILED', '获取学年列表失败'));
    }
  }

  /**
   * 根据年级获取班级列表
   */
  static async getClassesByGrade(req: Request, res: Response): Promise<void> {
    try {
      const { grade } = req.params;

      if (!grade) {
        res.status(400).json(ResponseUtils.error('CLASS_MISSING_GRADE', '年级参数不能为空'));
        return;
      }

      const classes = await ClassService.getClassesByGrade(grade);

      res.json(ResponseUtils.success(classes, '获取年级班级列表成功'));
    } catch (error: any) {
      logger.error('Get classes by grade error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_GET_BY_GRADE_FAILED', '获取年级班级列表失败'));
    }
  }

  /**
   * 批量创建班级（仅管理员）
   */
  static async batchCreateClasses(req: Request, res: Response): Promise<void> {
    try {
      const { classes } = req.body;

      if (!Array.isArray(classes) || classes.length === 0) {
        res.status(400).json(ResponseUtils.error('CLASS_INVALID_BATCH_DATA', '批量数据格式不正确'));
        return;
      }

      const results = await ClassService.batchCreateClasses(classes);

      // 记录批量创建日志
      logger.business('Batch create classes', {
        totalCount: classes.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        adminUserId: req.user?.userId,
        adminUsername: req.user?.username
      });

      res.json(ResponseUtils.success(results, `批量创建完成，成功${results.success.length}个，失败${results.failed.length}个`));
    } catch (error: any) {
      logger.error('Batch create classes error:', error);
      res.status(500).json(ResponseUtils.error('CLASS_BATCH_CREATE_FAILED', '批量创建班级失败'));
    }
  }
}

export default ClassController;