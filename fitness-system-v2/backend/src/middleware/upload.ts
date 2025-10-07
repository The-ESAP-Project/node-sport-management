import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import config from '../config';

// 确保上传目录存在
const uploadDir = config.upload.tempDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 生成唯一文件名：时间戳_原文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}_${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 检查文件类型
  const allowedTypes = config.upload.allowedTypes;
  const fileType = file.mimetype;
  
  if (allowedTypes.includes(fileType)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，只允许上传Excel文件'));
  }
};

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize, // 10MB
    files: 1 // 只允许上传一个文件
  }
});

// Excel文件上传中间件
export const uploadExcel = upload.single('file');

// 批量文件上传中间件（用于多个Excel文件）
export const uploadMultipleExcel = upload.array('files', 5); // 最多5个文件

// 错误处理中间件
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_FILE_TOO_LARGE',
            message: `文件大小超出限制，最大允许${config.upload.maxSize / 1024 / 1024}MB`
          }
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_TOO_MANY_FILES',
            message: '上传文件数量超出限制'
          }
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_UNEXPECTED_FIELD',
            message: '不期望的文件字段'
          }
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: error.message || '文件上传失败'
          }
        });
    }
  } else if (error.message) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_FILE_FILTER_ERROR',
        message: error.message
      }
    });
  }
  
  next(error);
};

export default {
  uploadExcel,
  uploadMultipleExcel,
  handleUploadError
};