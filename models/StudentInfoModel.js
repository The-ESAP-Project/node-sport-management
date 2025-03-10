const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const StudentInfo = sequelize.define('StudentInfo', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '自增主键'
    },
    StuRegisterNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '学籍号'
    },
    StuName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '学生姓名'
    },
    StuGender: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
        comment: '1: 男, 0: 女'
    },
    StuNation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '民族代码'
    },
    StuBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '出生日期 (YYYY-MM-DD)'
    },
    classID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID'
    },
}, {
    tableName: 'StudentInfo',
    timestamps: false
});

module.exports = StudentInfo;