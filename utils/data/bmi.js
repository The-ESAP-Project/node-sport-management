// BMI 标准数据
const bmiStandard = {
    // 男生BMI标准
    male: {
        // 高一、高二、高三的BMI范围
        ranges: {
            grade1: {
                lowWeight: 16.4,
                normal: 23.2,
                overWeight: 26.3
            },
            grade2: {
                lowWeight: 16.7,
                normal: 23.7,
                overWeight: 26.5
            },
            grade3: {
                lowWeight: 17.2,
                normal: 23.8,
                overWeight: 27.3
            }
        },
        // 各级别对应的得分
        scores: {
            lowWeight: 80,
            normal: 100,
            overWeight: 80,
            obesity: 60
        }
    },
    // 女生BMI标准
    female: {
        // 高一、高二、高三的BMI范围
        ranges: {
            grade1: {
                lowWeight: 16.4,
                normal: 22.7,
                overWeight: 25.2
            },
            grade2: {
                lowWeight: 16.8,
                normal: 23.2,
                overWeight: 25.4
            },
            grade3: {
                lowWeight: 17.0,
                normal: 23.3,
                overWeight: 25.7
            }
        },
        // 各级别对应的得分
        scores: {
            lowWeight: 80,
            normal: 100,
            overWeight: 80,
            obesity: 60
        }
    },
    // BMI级别描述
    levels: ["低体重", "正常", "超重", "肥胖"]
};

/**
 * 计算BMI相关指标
 * @param {number} weight - 体重，单位：kg
 * @param {number} height - 身高，单位：m
 * @param {string} gender - 性别，'male'或'female'
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns {Object} example: { bmi: 20.76, bmiScore: 100, bmiLevel: 1, bmiLevelDesc: '正常' }
 */
function calcualteBmiScore(weight, height, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    // 计算BMI值
    let bmiValue = weight / (height * height);
    
    // 获取对应性别和年级的BMI标准
    const gradeKey = `grade${grade}`;
    const standardRanges = bmiStandard[gender].ranges[gradeKey];
    const standardScores = bmiStandard[gender].scores;
    
    // 确定BMI级别和得分
    let bmiLevel, bmiScore;
    
    if (bmiValue <= standardRanges.lowWeight) {
        bmiLevel = 0; // 低体重
        bmiScore = standardScores.lowWeight;
    } else if (bmiValue <= standardRanges.normal) {
        bmiLevel = 1; // 正常
        bmiScore = standardScores.normal;
    } else if (bmiValue <= standardRanges.overWeight) {
        bmiLevel = 2; // 超重
        bmiScore = standardScores.overWeight;
    } else {
        bmiLevel = 3; // 肥胖
        bmiScore = standardScores.obesity;
    }
    
    // 格式化BMI值，保留两位小数
    bmiValue = Number(bmiValue.toFixed(2));
    
    return {
        bmi: bmiValue,
        bmiScore: bmiScore,
        bmiLevel: bmiLevel,
        bmiLevelDesc: bmiStandard.levels[bmiLevel]
    };
}


// console.log("男生高一示例:", calcualteBmiScore(65, 1.70, 'male', 1));
// console.log("女生高三示例:", calcualteBmiScore(55, 1.65, 'female', 3));

module.exports = calcualteBmiScore;
