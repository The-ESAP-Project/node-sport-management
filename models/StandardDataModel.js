const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// TODO: AI Generated, please check the fields

const StandardData = sequelize.define('StandardData', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '自增主键'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年份'
    },
    gradeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment
    },
    classID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment
    },
    vitalCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    fiftyRun: {
        type: DataTypes.FLOAT(5, 2),
        allowNull: true,
        comment
    },
    standingLongJump: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    sitAndReach: {
        type: DataTypes.FLOAT(5, 1),
        allowNull: true,
        comment
    },
    fiftyRunGrade: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment
    },
    standingLongJumpGrade: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment
    },
    sitAndReachGrade: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment
    },
    eightHundredRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    oneThousandRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    sitUp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    },
    pullUp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment
    }
}, {
    tableName: 'StandardData',
    timestamps: false
});

module.exports = StandardData;