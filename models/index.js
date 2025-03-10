const sequelize = require('.');
const User = require('./UserModel');
const StudentInfo = require('./StudentInfoModel');

// 导出所有模型
module.exports = {
  sequelize,
  User,
  StudentInfo
  // 添加其他模型...
};