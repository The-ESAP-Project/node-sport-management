// todo:
// 拿到.env 的配置信息 
// 使用Sequelize 连接数据库
// 1. 连接数据库
// 2. 执行sql语句
// 3. 关闭数据库

const dotenv = require('dotenv').config();
const { Sequelize } = require('sequelize');


//.env文件不存在则创建一个样例
if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', `
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=root
    DB_DATABASE=db
    DB_PORT=3306
    `)
}


// 创建连接池
try{
    const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
    })
} catch (error) {
    console.error('数据库连接失败', error);
}

