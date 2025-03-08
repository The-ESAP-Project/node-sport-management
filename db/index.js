const { Sequelize } = require('sequelize');

let dialectOptions = {};

if ( process.env.DB_DIALECT === 'postgres') {
    dialectOptions = {
        statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 180000,
        idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT) || 180000
    };
}

const sequelize = new Sequelize(
    process.env.DB_NAME || 'spm',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST ? process.env.DB_HOST : 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.DB_LOGGING === 'true',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 3,
            min: parseInt(process.env.DB_POOL_MIN) || 1,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000
        },
        dialectOptions: dialectOptions
    }
);

async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}

async function closeDatabase() {
    try {
        await sequelize.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
}

module.exports = {
    sequelize,
    connectDatabase,
    closeDatabase
};