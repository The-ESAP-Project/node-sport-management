import winston from 'winston';
import config from '../config';
import path from 'path';
import fs from 'fs';

// 确保日志目录存在
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  })
);

// 创建logger实例
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'fitness-system' },
  transports: [
    // 文件日志
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 错误日志单独文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// 开发环境添加控制台输出
if (config.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    )
  }));
}

// 扩展logger方法
interface ExtendedLogger extends winston.Logger {
  request: (req: any, message?: string) => void;
  auth: (message: string, meta?: any) => void;
  database: (message: string, meta?: any) => void;
  business: (message: string, meta?: any) => void;
}

const extendedLogger = logger as ExtendedLogger;

// 请求日志
extendedLogger.request = (req: any, message = 'Request') => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
    username: req.user?.username
  });
};

// 认证日志
extendedLogger.auth = (message: string, meta?: any) => {
  logger.info(`[AUTH] ${message}`, meta);
};

// 数据库日志
extendedLogger.database = (message: string, meta?: any) => {
  logger.info(`[DB] ${message}`, meta);
};

// 业务日志
extendedLogger.business = (message: string, meta?: any) => {
  logger.info(`[BIZ] ${message}`, meta);
};

export default extendedLogger;