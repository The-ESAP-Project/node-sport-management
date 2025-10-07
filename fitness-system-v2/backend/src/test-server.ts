// 简化的启动测试
import express from 'express';
import config from './config';
import logger from './utils/logger';

const app = express();

// 基本中间件
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 启动服务器
const server = app.listen(config.port, () => {
  logger.info(`✅ 测试服务器启动成功！`);
  logger.info(`端口: ${config.port}`);
  logger.info(`环境: ${config.nodeEnv}`);
  logger.info(`访问: http://localhost:${config.port}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});