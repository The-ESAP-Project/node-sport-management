import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

import config from './config';
import logger from './utils/logger';
import { connectDatabase, syncDatabase, closeDatabase } from './config/database';
import redisService from './config/redis';
import { initializeAssociations } from './models';
import { ApiResponse } from './types';
import { createDefaultAdmin } from './services/userService';
import { initializeDefaultStandards } from './utils/initDefaultStandards';
import SystemConfigService from './services/systemConfigService';

// 导入路由
import routes from './routes';

class App {
  public app: express.Application;
  
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }));

    // CORS配置
    this.app.use(cors({
      origin: (origin, callback) => {
        // 允许没有origin的请求（比如移动应用）
        if (!origin) return callback(null, true);
        
        if (config.cors.allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // 请求体解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 全局限流
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 每个IP最多1000次请求
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: '请求过于频繁，请稍后再试'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use(globalLimiter);

    // 请求日志记录
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.request(req);
      next();
    });
  }

  private initializeRoutes(): void {
    // 挂载所有路由
    this.app.use(routes);

    // 未找到的路由
    this.app.use('*', (req: Request, res: Response) => {
      logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`
        }
      } as ApiResponse);
    });
  }

  private initializeErrorHandling(): void {
    // 全局错误处理
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      logger.error('Global error handler:', error);

      // CORS错误
      if (error.message === 'Not allowed by CORS') {
        res.status(403).json({
          success: false,
          error: {
            code: 'CORS_ERROR',
            message: '跨域请求被拒绝'
          }
        } as ApiResponse);
        return;
      }

      // JSON解析错误
      if (error.type === 'entity.parse.failed') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: '请求体JSON格式错误'
          }
        } as ApiResponse);
        return;
      }

      // 请求体过大错误
      if (error.type === 'entity.too.large') {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: '请求体过大'
          }
        } as ApiResponse);
        return;
      }

      // 默认服务器错误
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: config.nodeEnv === 'development' ? error.message : '服务器内部错误'
        }
      } as ApiResponse);
    });
  }

  public async initialize(): Promise<boolean> {
    try {
      logger.info('Initializing application...');

      // 连接数据库
      logger.info('Connecting to database...');
      const dbConnected = await connectDatabase();
      if (!dbConnected) {
        logger.error('Database connection failed');
        return false;
      }

      // 连接Redis
      logger.info('Connecting to Redis...');
      const redisConnected = await redisService.connect();
      if (!redisConnected) {
        logger.error('Redis connection failed');
        return false;
      }

      // 初始化模型关联
      logger.info('Initializing model associations...');
      initializeAssociations();

      // 同步数据库
      logger.info('Synchronizing database...');
      const dbSynced = await syncDatabase(config.nodeEnv === 'development');
      if (!dbSynced) {
        logger.error('Database synchronization failed');
        return false;
      }

      // 创建默认管理员
      logger.info('Creating default admin user...');
      await createDefaultAdmin();

      // 初始化默认评分标准
      logger.info('Initializing default evaluation standards...');
      await initializeDefaultStandards();

      // 初始化默认系统配置
      logger.info('Initializing default system configs...');
      await SystemConfigService.initializeDefaultConfigs();

      logger.info('Application initialized successfully');
      return true;
    } catch (error) {
      logger.error('Application initialization failed:', error);
      return false;
    }
  }

  public async start(): Promise<void> {
    const server = this.app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Base URL: http://localhost:${config.port}${config.apiPrefix}`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await redisService.disconnect();
          await closeDatabase();
          logger.info('All connections closed, exiting process');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 未捕获异常处理
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

export default App;