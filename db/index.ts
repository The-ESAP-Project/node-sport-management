import { Sequelize } from 'sequelize';

let dialectOptions: any = {};

if (process.env.DB_DIALECT === 'postgres') {
    dialectOptions = {
        statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '180000'),
        idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT || '180000')
    };
}

const sequelize = new Sequelize(
    process.env.DB_NAME_DEV || process.env.DB_NAME || 'spm',
    process.env.DB_USER_DEV || process.env.DB_USER || 'root',
    process.env.DB_PASS_DEV || process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST_DEV || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT_DEV || process.env.DB_PORT || '3306'),
        dialect: process.env.DB_DIALECT as 'mysql' | 'postgres' | 'sqlite' | 'mssql' || 'mysql',
        logging: process.env.DB_LOGGING === 'true',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '3'),
            min: parseInt(process.env.DB_POOL_MIN || '1'),
            acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
            idle: parseInt(process.env.DB_POOL_IDLE || '10000')
        },
        dialectOptions: dialectOptions
    }
);

async function connectDatabase(): Promise<boolean> {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}

async function closeDatabase(): Promise<void> {
    try {
        await sequelize.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
}

async function syncDatabase(force: boolean = false): Promise<boolean> {
    try {
        // force: true 会先删除表再创建
        await sequelize.sync({ force });
        console.log('Database synchronized successfully');
        return true;
    } catch (error) {
        console.error('Error syncing database:', error);
        return false;
    }
}

// 导出 sequelize 实例
export default sequelize;
// 导出函数
export { connectDatabase, closeDatabase, syncDatabase };