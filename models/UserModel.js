const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '自增主键'
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '用户名'
    },
    password: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '密码'
    },
    role: {
        type: DataTypes.ENUM('superadmin', 'admin', 'user'),
        allowNull: false,
        comment: '角色'
    }
}, {
    tableName: 'User',
    timestamps: false
});

module.exports = User;