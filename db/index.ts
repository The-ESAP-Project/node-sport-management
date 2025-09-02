import { Sequelize } from 'sequelize';

// 动态导入 Logger 以避免循环依赖
let Logger: any = null;
const getLogger = async () => {
  if (!Logger) {
    Logger = (await import('../utils/logger')).default;
  }
  return Logger;
};

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

/**
 * 创建默认管理员账号
 * 只在数据库为空时创建
 */
async function createDefaultAdmin(): Promise<void> {
    try {
        const logger = await getLogger();

        // 动态导入以避免循环依赖
        const { default: UserModel } = await import('../models/UserModel');
        const PasswordUtils = (await import('../utils/password')).default;

        // 检查是否已有用户
        const existingUsers = await UserModel.findAll();
        if (existingUsers.length > 0) {
            logger.info('数据库已存在用户，跳过默认管理员创建');
            return;
        }

        // 创建默认管理员账号
        const defaultAdmin = {
            username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
            name: process.env.DEFAULT_ADMIN_NAME || '系统管理员',
            role: 'admin' as const,  // 使用正确的角色类型
            status: 'active' as const
        };

        // 验证密码强度
        const passwordValidation = PasswordUtils.validatePasswordStrength(defaultAdmin.password);
        if (!passwordValidation.isValid) {
            logger.warn(`默认管理员密码强度不足: ${passwordValidation.message}`);
            logger.warn('建议在环境变量中设置更强的 DEFAULT_ADMIN_PASSWORD');
        }

        // 哈希密码
        const hashedPassword = await PasswordUtils.hashPassword(defaultAdmin.password);

        // 创建用户
        const createdUser = await UserModel.create({
            ...defaultAdmin,
            password: hashedPassword
        });

        logger.info('✅ 默认管理员账号创建成功', {
            username: defaultAdmin.username,
            userId: createdUser.id,
            role: defaultAdmin.role
        });
        console.log('✅ Default admin account created successfully');
        console.log(`   Username: ${defaultAdmin.username}`);
        console.log(`   Role: ${defaultAdmin.role}`);
        console.log('   ⚠️  Please change the default password after first login!');

    } catch (error: any) {
        const logger = await getLogger();
        logger.error('❌ 创建默认管理员账号失败', {
            error: error.message,
            stack: error.stack
        });
        console.error('❌ Error creating default admin account:', error);
        // 不抛出错误，避免影响应用启动
    }
}

// 导出 sequelize 实例
export default sequelize;
// 导出函数
export { connectDatabase, closeDatabase, syncDatabase, createDefaultAdmin };