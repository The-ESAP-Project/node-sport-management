const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'sport-data-management',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.NODE_ENV === 'production' ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.DB_LOGGING === 'true',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 3,
            min: parseInt(process.env.DB_POOL_MIN) || 1,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000
        },
        dialectOptions: {
            statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 180000, // 查询超时时间（毫秒）
            idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT) || 180000 // 事务空闲超时时间（毫秒）
        }
    }
);

async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        exit(1);
    }
}

connectDatabase();

module.exports = sequelize;
