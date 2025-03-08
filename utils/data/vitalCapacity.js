// 肺活量标准数据
const vitalCapacityStandard = {
    // 男生肺活量标准
    male: {
        // 高一、高二、高三的肺活量范围和对应分数
        grade1: [
            { score: 100, value: 4540 },
            { score: 95, value: 4420 },
            { score: 90, value: 4300 },
            { score: 85, value: 4050 },
            { score: 80, value: 3800 },
            { score: 78, value: 3680 },
            { score: 76, value: 3560 },
            { score: 74, value: 3440 },
            { score: 72, value: 3320 },
            { score: 70, value: 3200 },
            { score: 68, value: 3080 },
            { score: 66, value: 2960 },
            { score: 64, value: 2840 },
            { score: 62, value: 2720 },
            { score: 60, value: 2600 },
            { score: 50, value: 2470 },
            { score: 40, value: 2340 },
            { score: 30, value: 2210 },
            { score: 20, value: 2080 },
            { score: 10, value: 1950 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 4740 },
            { score: 95, value: 4620 },
            { score: 90, value: 4500 },
            { score: 85, value: 4250 },
            { score: 80, value: 4000 },
            { score: 78, value: 3880 },
            { score: 76, value: 3760 },
            { score: 74, value: 3640 },
            { score: 72, value: 3520 },
            { score: 70, value: 3400 },
            { score: 68, value: 3280 },
            { score: 66, value: 3160 },
            { score: 64, value: 3040 },
            { score: 62, value: 2920 },
            { score: 60, value: 2800 },
            { score: 50, value: 2660 },
            { score: 40, value: 2520 },
            { score: 30, value: 2380 },
            { score: 20, value: 2240 },
            { score: 10, value: 2100 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 4940 },
            { score: 95, value: 4820 },
            { score: 90, value: 4700 },
            { score: 85, value: 4450 },
            { score: 80, value: 4200 },
            { score: 78, value: 4080 },
            { score: 76, value: 3960 },
            { score: 74, value: 3840 },
            { score: 72, value: 3720 },
            { score: 70, value: 3600 },
            { score: 68, value: 3480 },
            { score: 66, value: 3360 },
            { score: 64, value: 3240 },
            { score: 62, value: 3120 },
            { score: 60, value: 3000 },
            { score: 50, value: 2850 },
            { score: 40, value: 2700 },
            { score: 30, value: 2550 },
            { score: 20, value: 2400 },
            { score: 10, value: 2250 },
            { score: 0, value: 0 }
        ]
    },
    // 女生肺活量标准
    female: {
        // 高一、高二、高三的肺活量范围和对应分数
        grade1: [
            { score: 100, value: 3150 },
            { score: 95, value: 3100 },
            { score: 90, value: 3050 },
            { score: 85, value: 2900 },
            { score: 80, value: 2750 },
            { score: 78, value: 2650 },
            { score: 76, value: 2550 },
            { score: 74, value: 2450 },
            { score: 72, value: 2350 },
            { score: 70, value: 2250 },
            { score: 68, value: 2150 },
            { score: 66, value: 2050 },
            { score: 64, value: 1950 },
            { score: 62, value: 1850 },
            { score: 60, value: 1750 },
            { score: 50, value: 1710 },
            { score: 40, value: 1670 },
            { score: 30, value: 1630 },
            { score: 20, value: 1590 },
            { score: 10, value: 1550 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 3250 },
            { score: 95, value: 3200 },
            { score: 90, value: 3150 },
            { score: 85, value: 3000 },
            { score: 80, value: 2850 },
            { score: 78, value: 2750 },
            { score: 76, value: 2650 },
            { score: 74, value: 2550 },
            { score: 72, value: 2450 },
            { score: 70, value: 2350 },
            { score: 68, value: 2250 },
            { score: 66, value: 2150 },
            { score: 64, value: 2050 },
            { score: 62, value: 1950 },
            { score: 60, value: 1850 },
            { score: 50, value: 1810 },
            { score: 40, value: 1770 },
            { score: 30, value: 1730 },
            { score: 20, value: 1690 },
            { score: 10, value: 1650 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 3350 },
            { score: 95, value: 3300 },
            { score: 90, value: 3250 },
            { score: 85, value: 3100 },
            { score: 80, value: 2950 },
            { score: 78, value: 2850 },
            { score: 76, value: 2750 },
            { score: 74, value: 2650 },
            { score: 72, value: 2550 },
            { score: 70, value: 2450 },
            { score: 68, value: 2350 },
            { score: 66, value: 2250 },
            { score: 64, value: 2150 },
            { score: 62, value: 2050 },
            { score: 60, value: 1950 },
            { score: 50, value: 1910 },
            { score: 40, value: 1870 },
            { score: 30, value: 1830 },
            { score: 20, value: 1790 },
            { score: 10, value: 1750 },
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
 * 计算肺活量得分
 * @param {number} capacity - 肺活量值，单位：毫升
 * @param {string} gender - 性别，'male'或'female'
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns {Object} example: { capacity: 4300, score: 100, level: '优秀' }
 */
function calculateVitalCapacityScore(capacity, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    // 获取对应性别和年级的肺活量标准
    const gradeKey = `grade${grade}`;
    const standards = vitalCapacityStandard[gender][gradeKey];
    
    // 计算得分
    let score = 0;
    let level = '';
    
    // 找到第一个小于等于当前肺活量的标准
    for (let i = 0; i < standards.length - 1; i++) {
        if (capacity >= standards[i].value) {
            score = standards[i].score;
            break;
        }
    }
    
    // 肺活量低于最低标准，则给最低分
    if (score === 0 && standards.length > 0) {
        score = standards[standards.length - 1].score;
    }
    
    // 确定等级
    if (score >= vitalCapacityStandard.levels.excellent.min) {
        level = vitalCapacityStandard.levels.excellent.desc;
    } else if (score >= vitalCapacityStandard.levels.good.min) {
        level = vitalCapacityStandard.levels.good.desc;
    } else if (score >= vitalCapacityStandard.levels.pass.min) {
        level = vitalCapacityStandard.levels.pass.desc;
    } else {
        level = vitalCapacityStandard.levels.fail.desc;
    }
    
    return {
        capacity,
        score,
        level
    };
}


module.exports = calculateVitalCapacityScore;


// console.log("男生高一示例 (4300毫升):", calculateVitalCapacityScore(4300, 'male', 1));
// console.log("女生高三示例 (2500毫升):", calculateVitalCapacityScore(2500, 'female', 3));
