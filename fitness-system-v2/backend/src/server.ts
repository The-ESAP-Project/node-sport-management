import App from './app';
import logger from './utils/logger';

/**
 * 应用程序启动入口
 */
async function bootstrap() {
  try {
    logger.info('🚀 Starting Fitness System Backend...');
    
    const app = new App();
    
    // 初始化应用
    const initialized = await app.initialize();
    if (!initialized) {
      logger.error('❌ Application initialization failed');
      process.exit(1);
    }
    
    // 启动服务器
    await app.start();
    
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// 启动应用
bootstrap();