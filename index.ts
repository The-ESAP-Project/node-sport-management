import 'dotenv/config';
import os from 'os';
import fs from 'fs';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cluster from 'cluster';
import helmet from 'helmet';
// @ts-ignore
import bodyParser from 'body-parser';
// @ts-ignore
import cookieParser from 'cookie-parser';
import http from 'http';

// @ts-ignore
import authorize from './utils/authorizer';
// @ts-ignore
import { globalLimiter, authLimiter } from './utils/limiter';
// @ts-ignore
import jwtParser from './utils/jwtParser';
// @ts-ignore
import logger from './utils/logger';
// @ts-ignore
import models from './models';
// @ts-ignore
import { connectDatabase, closeDatabase, syncDatabase, createDefaultAdmin } from './db';
// @ts-ignore
import authRoutes from './routes/auth';
// @ts-ignore
import userRoutes from './routes/user';
// @ts-ignore
import studentRoutes from './routes/student';
// @ts-ignore
import classRoutes from './routes/classes';


const NEED_INIT_DB = process.env.NEED_INIT === 'true';
const API_BASE_ROUTE = process.env.API_BASE_ROUTE || '/api';
const numCPUs = process.env.NODE_ENV === 'development' ? 1 : os.cpus().length;

if (cluster.isPrimary) {
  logger.system.startup(`Master process started with PID ${process.pid}`);
  const pidFile = path.join(__dirname, 'spm_backend.pid');
  fs.writeFileSync(pidFile, process.pid.toString());

  (async () => {
    logger.system.database('connection_attempt');
    const connected = await connectDatabase();
    if (!connected) {
      logger.system.error(new Error('Database connection failed'), 'master_process');
      process.exit(1);
    }

    logger.system.database('sync_attempt', { needInit: NEED_INIT_DB });
    const synced = await syncDatabase( NEED_INIT_DB );
    if (!synced) {
      logger.system.error(new Error('Database synchronization failed'), 'master_process');
      process.exit(1);
    }

    // 创建默认管理员账号
    logger.system.database('create_default_admin');
    await createDefaultAdmin();
    
    logger.system.database('initialization_completed');

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
      logger.info(`Worker process ${i + 1} forked`);
    }
  })();

  process.on('SIGINT', async () => {
    logger.system.shutdown('Received SIGINT signal, shutting down server');
    for (const id in cluster.workers) {
      if (cluster.workers[id]) {
        cluster.workers[id]!.kill('SIGINT');
      }
    }
    
    await closeDatabase();
    
    fs.unlinkSync(pidFile);
    logger.system.shutdown('PID file removed, master process exiting');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.system.shutdown('Received SIGTERM signal, shutting down server');
    
    for (const id in cluster.workers) {
      if (cluster.workers[id]) {
        cluster.workers[id]!.kill('SIGTERM');
      }
    }
    
    await closeDatabase();
    
    fs.unlinkSync(pidFile);
    logger.system.shutdown('PID file removed, master process exiting');
    process.exit(0);
  });

  process.on('uncaughtException', async (err) => {
    logger.system.error(err, 'master_process_uncaught_exception');
    
    await closeDatabase();
    process.exit(1);
  });

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker process ${worker.process.pid} exited`, {
      code,
      signal,
      action: 'worker_exit'
    });
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      logger.warn('Worker crashed, starting a new worker');
      cluster.fork();
    }
  });

} else {
  logger.system.startup(`Worker process ${process.pid} started`);
  const app = express();
  
  app.use(helmet());

  const PORT = process.env.PORT || 8012;
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

  const server = http.createServer(app);

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(globalLimiter);
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(jwtParser);

  app.use(`${API_BASE_ROUTE}/v1/auth`, authLimiter, authRoutes);
  app.use(`${API_BASE_ROUTE}/v1/user`, authorize(['admin']), userRoutes);
  app.use(`${API_BASE_ROUTE}/v1/students`, authorize(['admin']), studentRoutes);
  app.use(`${API_BASE_ROUTE}/v1/classes`, authorize(['admin']), classRoutes);

  app.use(`/*path`, (req, res) => {
    logger.warn(`API endpoint not found: ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: logger.getClientIP(req),
      action: 'api_not_found'
    });
    res.status(404).json({
      code: -1,
      message: `API endpoint not found: ${req.originalUrl}`,
      data: null
    });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.system.error(err, 'global_error_handler');
    res.status(500).json({
      code: -1, 
      message: 'Internal server error',
      data: process.env.NODE_ENV === 'development' ? err.message : null
    });
  });
  
  server.listen(PORT, () => {
    logger.system.startup(`Server listening on port ${PORT}`);
  });

  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      logger.system.error(error, 'server_error');
      throw error;
    }
    
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`, { port: PORT, action: 'port_in_use' });
      process.exit(1);
    } else {
      logger.system.error(error, 'server_listen_error');
      throw error;
    }
  });

  process.on('uncaughtException', (err) => {
    logger.system.error(err, 'worker_uncaught_exception');
    
    server.close(() => {
      logger.system.shutdown(`Worker process ${process.pid} closed due to uncaught exception`);
      process.exit(1);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.system.error(new Error(`Unhandled promise rejection: ${reason}`), 'worker_unhandled_rejection');
  });

  process.on('SIGINT', () => {
    logger.system.shutdown(`Worker process ${process.pid} received SIGINT signal`);
    server.close(() => {
      logger.system.shutdown(`Worker process ${process.pid} has closed HTTP server`);
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    logger.system.shutdown(`Worker process ${process.pid} received SIGTERM signal`);
    server.close(() => {
      logger.system.shutdown(`Worker process ${process.pid} has closed HTTP server`);
      process.exit(0);
    });
  });

  process.on('exit', (code) => {
    logger.info(`Worker process ${process.pid} exited`, { code, action: 'worker_exit' });
  });
}