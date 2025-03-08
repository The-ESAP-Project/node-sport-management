// 50米跑标准数据
const running50mStandard = {
    // 男生50米跑标准（秒）
    male: {
        // 高一、高二、高三的50米跑时间范围和对应分数
        grade1: [
            { score: 100, value: 7.1 },
            { score: 95, value: 7.2 },
            { score: 90, value: 7.3 },
            { score: 85, value: 7.4 },
            { score: 80, value: 7.5 },
            { score: 78, value: 7.7 },
            { score: 76, value: 7.9 },
            { score: 74, value: 8.1 },
            { score: 72, value: 8.3 },
            { score: 70, value: 8.5 },
            { score: 68, value: 8.7 },
            { score: 66, value: 8.9 },
            { score: 64, value: 9.1 },
            { score: 62, value: 9.3 },
            { score: 60, value: 9.5 },
            { score: 50, value: 9.7 },
            { score: 40, value: 9.9 },
            { score: 30, value: 10.1 },
            { score: 20, value: 10.3 },
            { score: 10, value: 10.5 },
            { score: 0, value: 99 }
        ],
        grade2: [
            { score: 100, value: 7.0 },
            { score: 95, value: 7.1 },
            { score: 90, value: 7.2 },
            { score: 85, value: 7.3 },
            { score: 80, value: 7.4 },
            { score: 78, value: 7.6 },
            { score: 76, value: 7.8 },
            { score: 74, value: 8.0 },
            { score: 72, value: 8.2 },
            { score: 70, value: 8.4 },
            { score: 68, value: 8.6 },
            { score: 66, value: 8.8 },
            { score: 64, value: 9.0 },
            { score: 62, value: 9.2 },
            { score: 60, value: 9.4 },
            { score: 50, value: 9.6 },
            { score: 40, value: 9.8 },
            { score: 30, value: 10.0 },
            { score: 20, value: 10.2 },
            { score: 10, value: 10.4 },
            { score: 0, value: 99 }
        ],
        grade3: [
            { score: 100, value: 6.8 },
            { score: 95, value: 6.9 },
            { score: 90, value: 7.0 },
            { score: 85, value: 7.1 },
            { score: 80, value: 7.2 },
            { score: 78, value: 7.4 },
            { score: 76, value: 7.6 },
            { score: 74, value: 7.8 },
            { score: 72, value: 8.0 },
            { score: 70, value: 8.2 },
            { score: 68, value: 8.4 },
            { score: 66, value: 8.6 },
            { score: 64, value: 8.8 },
            { score: 62, value: 9.0 },
            { score: 60, value: 9.2 },
            { score: 50, value: 9.4 },
            { score: 40, value: 9.6 },
            { score: 30, value: 9.8 },
            { score: 20, value: 10.0 },
            { score: 10, value: 10.2 },
            { score: 0, value: 99 }
        ]
    },
    // 女生50米跑标准（秒）
    female: {
        // 高一、高二、高三的50米跑时间范围和对应分数
        grade1: [
            { score: 100, value: 7.8 },
            { score: 95, value: 7.9 },
            { score: 90, value: 8.0 },
            { score: 85, value: 8.3 },
            { score: 80, value: 8.6 },
            { score: 78, value: 8.8 },
            { score: 76, value: 9.0 },
            { score: 74, value: 9.1 },
            { score: 72, value: 9.3 },
            { score: 70, value: 9.5 },
            { score: 68, value: 9.8 },
            { score: 66, value: 10.0 },
            { score: 64, value: 10.2 },
            { score: 62, value: 10.4 },
            { score: 60, value: 10.6 },
            { score: 50, value: 10.8 },
            { score: 40, value: 11.0 },
            { score: 30, value: 11.2 },
            { score: 20, value: 11.4 },
            { score: 10, value: 11.6 },
            { score: 0, value: 99 }
        ],
        grade2: [
            { score: 100, value: 7.7 },
            { score: 95, value: 7.8 },
            { score: 90, value: 7.9 },
            { score: 85, value: 8.2 },
            { score: 80, value: 8.5 },
            { score: 78, value: 8.7 },
            { score: 76, value: 8.9 },
            { score: 74, value: 9.0 },
            { score: 72, value: 9.2 },
            { score: 70, value: 9.4 },
            { score: 68, value: 9.7 },
            { score: 66, value: 9.9 },
            { score: 64, value: 10.1 },
            { score: 62, value: 10.3 },
            { score: 60, value: 10.5 },
            { score: 50, value: 10.7 },
            { score: 40, value: 10.9 },
            { score: 30, value: 11.1 },
            { score: 20, value: 11.3 },
            { score: 10, value: 11.5 },
            { score: 0, value: 99 }
        ],
        grade3: [
            { score: 100, value: 7.6 },
            { score: 95, value: 7.7 },
            { score: 90, value: 7.8 },
            { score: 85, value: 8.1 },
            { score: 80, value: 8.4 },
            { score: 78, value: 8.6 },
            { score: 76, value: 8.8 },
            { score: 74, value: 9.0 },
            { score: 72, value: 9.2 },
            { score: 70, value: 9.4 },
            { score: 68, value: 9.6 },
            { score: 66, value: 9.8 },
            { score: 64, value: 10.0 },
            { score: 62, value: 10.2 },
            { score: 60, value: 10.4 },
            { score: 50, value: 10.6 },
            { score: 40, value: 10.8 },
            { score: 30, value: 11.0 },
            { score: 20, value: 11.2 },
            { score: 10, value: 11.4 },
            { score: 0, value: 99 }
        ]
    },
    // 等级描述
    levels: {
        excellent: { min: 85, desc: "优秀" },
        good: { min: 70, desc: "良好" },
        pass: { min: 60, desc: "及格" },
        fail: { min: 0, desc: "不及格" }
    }
};

/**
 * 计算50米跑得分
 * @param {number} time - 50米跑时间，单位：秒
 * @param {string} gender - 性别，'male'或'female'
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns {Object} example: { time: 6.3, score: 100, level: '优秀' }
 */
function calculateRunning50mScore(time, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    // 获取对应性别和年级的50米跑标准
    const gradeKey = `grade${grade}`;
    const standards = running50mStandard[gender][gradeKey];


    let score = 0;
    let level = '';
    
    // 找到第一个大于等于当前时间的标准
    for (let i = 0; i < standards.length - 1; i++) {
        if (time <= standards[i].value) {
            score = standards[i].score;
            break;
        }
    }
    
    // 时间超过所有标准，则给最低分
    if (score === 0 && standards.length > 0) {
        score = standards[standards.length - 1].score;
    }
    
    // 确定等级
    if (score >= running50mStandard.levels.excellent.min) {
        level = running50mStandard.levels.excellent.desc;
    } else if (score >= running50mStandard.levels.good.min) {
        level = running50mStandard.levels.good.desc;
    } else if (score >= running50mStandard.levels.pass.min) {
        level = running50mStandard.levels.pass.desc;
    } else {
        level = running50mStandard.levels.fail.desc;
    }
    
    return {
        time,
        score,
        level
    };
}


module.exports = calculateRunning50mScore;


// console.log("男生高一示例 (7.3秒):", calculateRunning50mScore(6.3, 'male', 1));
// console.log("女生高三示例 (8.0秒):", calculateRunning50mScore(8.0, 'female', 3)); 