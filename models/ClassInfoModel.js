const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const ClassInfo = sequelize.define('ClassInfo', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '自增主键'
    },
    classID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID'
    },
    className: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '班级名称'
    }
}, {
    tableName: 'ClassInfo',
    timestamps: false
});

module.exports = ClassInfo;