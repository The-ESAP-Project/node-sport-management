import { Sequelize } from 'sequelize';
import config from '../config';
import logger from '../utils/logger';

// 创建Sequelize实例
const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: config.database.dialect,
  logging: config.database.logging ? (sql: string) => logger.database('SQL Query', { sql }) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// 数据库连接测试
export const connectDatabase = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.database('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// 数据库同步
export const syncDatabase = async (force: boolean = false): Promise<boolean> => {
  try {
    await sequelize.sync({ force });
    logger.database(`Database synchronized successfully${force ? ' (force mode)' : ''}`);
    return true;
  } catch (error) {
    logger.error('Error syncing database:', error);
    return false;
  }
};

// 关闭数据库连接
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.database('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

export default sequelize;