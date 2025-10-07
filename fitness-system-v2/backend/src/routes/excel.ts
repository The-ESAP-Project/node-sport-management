import { Router } from 'express';
import ExcelController from '../controllers/excelController';
import { authenticate, requireAdmin, requireClass } from '../middleware/auth';
import { uploadExcel, handleUploadError } from '../middleware/upload';
import { body, param, validationResult } from 'express-validator';
import { ResponseUtils } from '../utils/helpers';

const router: Router = Router();

// 验证中间件
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', '请求参数验证失败', errors.array()));
  }
  next();
};

/**
 * @route POST /api/excel/upload/preview
 * @desc 上传并预览Excel文件
 * @access Private (Admin/Class)
 */
router.post('/upload/preview', 
  authenticate, 
  requireClass, 
  uploadExcel, 
  handleUploadError, 
  ExcelController.uploadAndPreviewExcel
);

/**
 * @route POST /api/excel/import/confirm
 * @desc 确认导入Excel数据
 * @access Private (Admin/Class)
 */
router.post('/import/confirm', authenticate, requireClass, [
  body('previewId')
    .notEmpty()
    .withMessage('预览ID不能为空')
    .isUUID()
    .withMessage('预览ID格式不正确')
], validateRequest, ExcelController.confirmImportExcel);

/**
 * @route GET /api/excel/export/class/:classID/year/:year
 * @desc 导出班级学生数据
 * @access Private (Admin/Class)
 */
router.get('/export/class/:classID/year/:year', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数')
], validateRequest, ExcelController.exportClassStudents);

/**
 * @route GET /api/excel/template/download
 * @desc 下载导入模板
 * @access Private
 */
router.get('/template/download', authenticate, ExcelController.downloadTemplate);

/**
 * @route GET /api/excel/preview/:previewId/status
 * @desc 获取预览数据状态
 * @access Private (Admin/Class)
 */
router.get('/preview/:previewId/status', authenticate, requireClass, [
  param('previewId')
    .isUUID()
    .withMessage('预览ID格式不正确')
], validateRequest, ExcelController.getPreviewStatus);

/**
 * @route DELETE /api/excel/preview/:previewId/cancel
 * @desc 取消预览（清理数据）
 * @access Private (Admin/Class)
 */
router.delete('/preview/:previewId/cancel', authenticate, requireClass, [
  param('previewId')
    .isUUID()
    .withMessage('预览ID格式不正确')
], validateRequest, ExcelController.cancelPreview);

/**
 * @route GET /api/excel/process/:processId/progress
 * @desc 获取Excel处理进度
 * @access Private (Admin/Class)
 */
router.get('/process/:processId/progress', authenticate, requireClass, [
  param('processId')
    .isUUID()
    .withMessage('处理ID格式不正确')
], validateRequest, ExcelController.getProcessProgress);

export default router;