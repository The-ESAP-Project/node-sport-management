import { Request, Response } from 'express';
import { ExcelService } from '../services/excelService';
import { ResponseUtils } from '../utils/helpers';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

export class ExcelController {
  /**
   * 上传并预览Excel文件
   */
  static async uploadAndPreviewExcel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json(ResponseUtils.error('EXCEL_NO_FILE', '请选择要上传的Excel文件'));
        return;
      }

      const filePath = req.file.path;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json(ResponseUtils.error('EXCEL_NO_USER', '用户未认证'));
        return;
      }

      // 验证文件类型
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        // 删除上传的文件
        await fs.unlink(filePath);
        res.status(400).json(ResponseUtils.error('EXCEL_INVALID_TYPE', '只支持.xlsx和.xls格式的Excel文件'));
        return;
      }

      const previewResult = await ExcelService.previewExcelData(filePath, userId);

      res.json(ResponseUtils.success(previewResult, 'Excel文件预览成功'));
    } catch (error: any) {
      logger.error('Upload and preview excel error:', error);
      
      // 清理上传的文件
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          logger.warn('Failed to cleanup uploaded file:', req.file.path);
        }
      }
      
      res.status(500).json(ResponseUtils.error('EXCEL_PREVIEW_FAILED', error.message || 'Excel文件预览失败'));
    }
  }

  /**
   * 确认导入Excel数据
   */
  static async confirmImportExcel(req: Request, res: Response): Promise<void> {
    try {
      const { previewId } = req.body;
      const userId = req.user?.userId;

      if (!previewId) {
        res.status(400).json(ResponseUtils.error('EXCEL_MISSING_PREVIEW_ID', '预览ID不能为空'));
        return;
      }

      if (!userId) {
        res.status(401).json(ResponseUtils.error('EXCEL_NO_USER', '用户未认证'));
        return;
      }

      const importResult = await ExcelService.confirmImportExcelData(previewId, userId);

      res.json(ResponseUtils.success(importResult, `导入完成，成功${importResult.success}条，失败${importResult.failed.length}条`));
    } catch (error: any) {
      logger.error('Confirm import excel error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_IMPORT_FAILED', error.message || '确认导入失败'));
    }
  }

  /**
   * 导出班级学生数据
   */
  static async exportClassStudents(req: Request, res: Response): Promise<void> {
    try {
      const { classID, year } = req.params;
      const { includeScores = 'true' } = req.query;

      const classId = parseInt(classID, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(classId) || isNaN(yearNum)) {
        res.status(400).json(ResponseUtils.error('EXCEL_INVALID_PARAMS', '无效的班级ID或年份'));
        return;
      }

      const includeScoresFlag = includeScores === 'true';
      const filePath = await ExcelService.exportClassStudentsToExcel(classId, yearNum, includeScoresFlag);

      // 设置响应头
      const fileName = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // 发送文件
      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error('Send file error:', err);
          if (!res.headersSent) {
            res.status(500).json(ResponseUtils.error('EXCEL_DOWNLOAD_FAILED', '文件下载失败'));
          }
        } else {
          // 发送成功后删除临时文件
          fs.unlink(filePath).catch(deleteErr => {
            logger.warn('Failed to delete temp export file:', filePath, deleteErr);
          });
        }
      });
    } catch (error: any) {
      logger.error('Export class students error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_EXPORT_FAILED', error.message || '导出失败'));
    }
  }

  /**
   * 下载导入模板
   */
  static async downloadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const filePath = await ExcelService.getImportTemplate();

      // 设置响应头
      const fileName = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // 发送文件
      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error('Send template file error:', err);
          if (!res.headersSent) {
            res.status(500).json(ResponseUtils.error('EXCEL_TEMPLATE_DOWNLOAD_FAILED', '模板下载失败'));
          }
        } else {
          // 发送成功后删除临时文件
          fs.unlink(filePath).catch(deleteErr => {
            logger.warn('Failed to delete temp template file:', filePath, deleteErr);
          });
        }
      });
    } catch (error: any) {
      logger.error('Download template error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_TEMPLATE_FAILED', error.message || '生成模板失败'));
    }
  }

  /**
   * 获取预览数据状态
   */
  static async getPreviewStatus(req: Request, res: Response): Promise<void> {
    try {
      const { previewId } = req.params;
      const userId = req.user?.userId;

      if (!previewId) {
        res.status(400).json(ResponseUtils.error('EXCEL_MISSING_PREVIEW_ID', '预览ID不能为空'));
        return;
      }

      if (!userId) {
        res.status(401).json(ResponseUtils.error('EXCEL_NO_USER', '用户未认证'));
        return;
      }

      // 从Redis获取预览数据
      const redisService = require('../config/redis').default;
      const previewDataStr = await redisService.get(`excel_preview:${previewId}`);
      
      if (!previewDataStr) {
        res.status(404).json(ResponseUtils.error('EXCEL_PREVIEW_EXPIRED', '预览数据已过期或不存在'));
        return;
      }

      const previewData = JSON.parse(previewDataStr);
      
      // 验证用户权限
      if (previewData.userId !== userId) {
        res.status(403).json(ResponseUtils.error('EXCEL_PREVIEW_ACCESS_DENIED', '无权访问此预览数据'));
        return;
      }

      res.json(ResponseUtils.success({
        previewId,
        summary: previewData.summary,
        createdAt: previewData.createdAt,
        expiresAt: previewData.expiresAt,
        status: 'ready'
      }, '获取预览状态成功'));
    } catch (error: any) {
      logger.error('Get preview status error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_GET_STATUS_FAILED', error.message || '获取预览状态失败'));
    }
  }

  /**
   * 取消预览（清理数据）
   */
  static async cancelPreview(req: Request, res: Response): Promise<void> {
    try {
      const { previewId } = req.params;
      const userId = req.user?.userId;

      if (!previewId) {
        res.status(400).json(ResponseUtils.error('EXCEL_MISSING_PREVIEW_ID', '预览ID不能为空'));
        return;
      }

      if (!userId) {
        res.status(401).json(ResponseUtils.error('EXCEL_NO_USER', '用户未认证'));
        return;
      }

      // 从Redis获取预览数据
      const redisService = require('../config/redis').default;
      const previewDataStr = await redisService.get(`excel_preview:${previewId}`);
      
      if (previewDataStr) {
        const previewData = JSON.parse(previewDataStr);
        
        // 验证用户权限
        if (previewData.userId === userId) {
          // 删除Redis数据
          await redisService.del(`excel_preview:${previewId}`);
          
          // 删除临时文件
          try {
            await fs.unlink(previewData.filePath);
          } catch (error) {
            logger.warn('Failed to delete temp file during cancel:', previewData.filePath);
          }
        }
      }

      res.json(ResponseUtils.success(null, '预览已取消'));
    } catch (error: any) {
      logger.error('Cancel preview error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_CANCEL_FAILED', error.message || '取消预览失败'));
    }
  }

  /**
   * 获取Excel处理进度（用于长时间操作）
   */
  static async getProcessProgress(req: Request, res: Response): Promise<void> {
    try {
      const { processId } = req.params;
      const userId = req.user?.userId;

      if (!processId) {
        res.status(400).json(ResponseUtils.error('EXCEL_MISSING_PROCESS_ID', '处理ID不能为空'));
        return;
      }

      if (!userId) {
        res.status(401).json(ResponseUtils.error('EXCEL_NO_USER', '用户未认证'));
        return;
      }

      // 从Redis获取处理进度
      const redisService = require('../config/redis').default;
      const progressDataStr = await redisService.get(`excel_progress:${processId}`);
      
      if (!progressDataStr) {
        res.status(404).json(ResponseUtils.error('EXCEL_PROCESS_NOT_FOUND', '处理进度不存在'));
        return;
      }

      const progressData = JSON.parse(progressDataStr);
      
      // 验证用户权限
      if (progressData.userId !== userId) {
        res.status(403).json(ResponseUtils.error('EXCEL_PROCESS_ACCESS_DENIED', '无权访问此处理进度'));
        return;
      }

      res.json(ResponseUtils.success(progressData, '获取处理进度成功'));
    } catch (error: any) {
      logger.error('Get process progress error:', error);
      res.status(500).json(ResponseUtils.error('EXCEL_GET_PROGRESS_FAILED', error.message || '获取处理进度失败'));
    }
  }
}

export default ExcelController;