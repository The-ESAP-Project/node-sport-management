const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const SportData = sequelize.define('SportData', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '自增主键'
    },
    studentID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '学生ID'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年份'
    },
    gradeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年级ID'
    },
    classID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID'
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '身高 (cm)'
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: '体重 (kg)'
    },
    vitalCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '肺活量 (mL)'
    },
    fiftyRun: {
        type: DataTypes.FLOAT(5, 2),
        allowNull: true,
        comment: '50米跑 (秒数)'
    },
    standingLongJump: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '立定跳远 (cm)'
    },
    sitAndReach: {
        type: DataTypes.FLOAT(5, 1),
        allowNull: true,
        comment: '坐位体前屈 (cm)'
    },
    eightHundredRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '800米跑 (秒数)'
    },
    oneThousandRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '1000米跑 (秒数)'
    },
    sitUp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '仰卧起坐 (个数)'
    },
    pullUp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '引体向上 (个数)'
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '综合成绩'
    },
}, {
    tableName: 'SportData',
    timestamps: false
});

SportData.prototype.getEightHundredRunFormatted = function() {
    if (this.eightHundredRun === null) return null;
    const minutes = Math.floor(this.eightHundredRun / 60);
    const seconds = this.eightHundredRun % 60;
    return `${minutes}'${seconds.toString().padStart(2, '0')}`;
};

SportData.prototype.getOneThousandRunFormatted = function() {
    if (this.oneThousandRun === null) return null;
    const minutes = Math.floor(this.oneThousandRun / 60);
    const seconds = this.oneThousandRun % 60;
    return `${minutes}'${seconds.toString().padStart(2, '0')}`;
};

module.exports = SportData;
