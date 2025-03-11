// 男生引体向上和女生仰卧起坐标准数据
const sitUpAndPullUpStandard = {
    // 男生引体向上标准（次）
    male: {
        // 高一、高二、高三的引体向上范围和对应分数
        grade1: [
            { score: 100, value: 16 },
            { score: 95, value: 15 },
            { score: 90, value: 14 },
            { score: 85, value: 13 },
            { score: 80, value: 12 },
            { score: 78, value: 11 },
            { score: 76, value: 11 },
            { score: 74, value: 10 },
            { score: 72, value: 10 },
            { score: 70, value: 9 },
            { score: 68, value: 9 },
            { score: 66, value: 8 },
            { score: 64, value: 8 },
            { score: 62, value: 7 },
            { score: 60, value: 7 },
            { score: 50, value: 6 },
            { score: 40, value: 5 },
            { score: 30, value: 4 },
            { score: 20, value: 3 },
            { score: 10, value: 2 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 17 },
            { score: 95, value: 16 },
            { score: 90, value: 15 },
            { score: 85, value: 14 },
            { score: 80, value: 13 },
            { score: 78, value: 12 },
            { score: 76, value: 12 },
            { score: 74, value: 11 },
            { score: 72, value: 11 },
            { score: 70, value: 10 },
            { score: 68, value: 10 },
            { score: 66, value: 9 },
            { score: 64, value: 9 },
            { score: 62, value: 8 },
            { score: 60, value: 8 },
            { score: 50, value: 7 },
            { score: 40, value: 6 },
            { score: 30, value: 5 },
            { score: 20, value: 4 },
            { score: 10, value: 3 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 18 },
            { score: 95, value: 17 },
            { score: 90, value: 16 },
            { score: 85, value: 15 },
            { score: 80, value: 14 },
            { score: 78, value: 13 },
            { score: 76, value: 13 },
            { score: 74, value: 12 },
            { score: 72, value: 12 },
            { score: 70, value: 11 },
            { score: 68, value: 11 },
            { score: 66, value: 10 },
            { score: 64, value: 10 },
            { score: 62, value: 9 },
            { score: 60, value: 9 },
            { score: 50, value: 8 },
            { score: 40, value: 7 },
            { score: 30, value: 6 },
            { score: 20, value: 5 },
            { score: 10, value: 4 },
            { score: 0, value: 0 }
        ]
    },
    // 女生仰卧起坐标准（次）
    female: {
        // 高一、高二、高三的仰卧起坐范围和对应分数
        grade1: [
            { score: 100, value: 53 },
            { score: 95, value: 51 },
            { score: 90, value: 49 },
            { score: 85, value: 46 },
            { score: 80, value: 43 },
            { score: 78, value: 41 },
            { score: 76, value: 39 },
            { score: 74, value: 37 },
            { score: 72, value: 35 },
            { score: 70, value: 33 },
            { score: 68, value: 31 },
            { score: 66, value: 29 },
            { score: 64, value: 27 },
            { score: 62, value: 25 },
            { score: 60, value: 23 },
            { score: 50, value: 21 },
            { score: 40, value: 19 },
            { score: 30, value: 17 },
            { score: 20, value: 15 },
            { score: 10, value: 13 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 54 },
            { score: 95, value: 52 },
            { score: 90, value: 50 },
            { score: 85, value: 47 },
            { score: 80, value: 44 },
            { score: 78, value: 42 },
            { score: 76, value: 40 },
            { score: 74, value: 38 },
            { score: 72, value: 36 },
            { score: 70, value: 34 },
            { score: 68, value: 32 },
            { score: 66, value: 30 },
            { score: 64, value: 28 },
            { score: 62, value: 26 },
            { score: 60, value: 24 },
            { score: 50, value: 22 },
            { score: 40, value: 20 },
            { score: 30, value: 18 },
            { score: 20, value: 16 },
            { score: 10, value: 14 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 55 },
            { score: 95, value: 53 },
            { score: 90, value: 51 },
            { score: 85, value: 48 },
            { score: 80, value: 45 },
            { score: 78, value: 43 },
            { score: 76, value: 41 },
            { score: 74, value: 39 },
            { score: 72, value: 37 },
            { score: 70, value: 35 },
            { score: 68, value: 33 },
            { score: 66, value: 31 },
            { score: 64, value: 29 },
            { score: 62, value: 27 },
            { score: 60, value: 25 },
            { score: 50, value: 23 },
            { score: 40, value: 21 },
            { score: 30, value: 19 },
            { score: 20, value: 17 },
            { score: 10, value: 15 },
            { score: 0, value: 0 }
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
 * 计算引体向上（男生）或仰卧起坐（女生）得分
 * @param {number} count - 完成次数
 * @param {string} gender - 性别，'male'（引体向上）或'female'（仰卧起坐）
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns example: { count: 16, score: 90, level: "优秀" }
 */
function calculateSitUpAndPullUpScore(count, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    // 获取对应性别和年级的标准
    const gradeKey = `grade${grade}`;
    const standards = sitUpAndPullUpStandard[gender][gradeKey];
    
    // 计算得分
    let score = 0;
    let level = '';

    for (let i = 0; i < standards.length - 1; i++) {
        if (count >= standards[i].value) {
            score = standards[i].score;
            break;
        }
    }
    
    // 次数小于所有标准，则给最低分
    if (score === 0 && standards.length > 0) {
        score = standards[standards.length - 1].score;
    }
    
    // 确定等级
    if (score >= sitUpAndPullUpStandard.levels.excellent.min) {
        level = sitUpAndPullUpStandard.levels.excellent.desc;
    } else if (score >= sitUpAndPullUpStandard.levels.good.min) {
        level = sitUpAndPullUpStandard.levels.good.desc;
    } else if (score >= sitUpAndPullUpStandard.levels.pass.min) {
        level = sitUpAndPullUpStandard.levels.pass.desc;
    } else {
        level = sitUpAndPullUpStandard.levels.fail.desc;
    }
    
    return {
        count,
        score,
        level
    };
}

module.exports = calculateSitUpAndPullUpScore;


// console.log("男生高一引体向上示例 (14次):", calculateSitUpAndPullUpScore(14, 'male', 1));
// console.log("女生高三仰卧起坐示例 (48次):", calculateSitUpAndPullUpScore(48, 'female', 3)); 