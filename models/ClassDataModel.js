const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const ClassData = sequelize.define('ClassData', {
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
    tableName: 'ClassData',
    timestamps: false
});

module.exports = ClassData;