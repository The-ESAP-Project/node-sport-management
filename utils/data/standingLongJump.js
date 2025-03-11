// 立定跳远标准数据
const standingLongJumpStandard = {
    // 男生立定跳远标准（厘米）
    male: {
        // 高一、高二、高三的立定跳远范围和对应分数
        grade1: [
            { score: 100, value: 260 },
            { score: 95, value: 255 },
            { score: 90, value: 250 },
            { score: 85, value: 243 },
            { score: 80, value: 235 },
            { score: 78, value: 231 },
            { score: 76, value: 227 },
            { score: 74, value: 223 },
            { score: 72, value: 219 },
            { score: 70, value: 215 },
            { score: 68, value: 211 },
            { score: 66, value: 207 },
            { score: 64, value: 203 },
            { score: 62, value: 199 },
            { score: 60, value: 195 },
            { score: 50, value: 190 },
            { score: 40, value: 185 },
            { score: 30, value: 180 },
            { score: 20, value: 175 },
            { score: 10, value: 170 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 265 },
            { score: 95, value: 260 },
            { score: 90, value: 255 },
            { score: 85, value: 248 },
            { score: 80, value: 240 },
            { score: 78, value: 236 },
            { score: 76, value: 232 },
            { score: 74, value: 228 },
            { score: 72, value: 224 },
            { score: 70, value: 220 },
            { score: 68, value: 216 },
            { score: 66, value: 212 },
            { score: 64, value: 208 },
            { score: 62, value: 204 },
            { score: 60, value: 200 },
            { score: 50, value: 195 },
            { score: 40, value: 190 },
            { score: 30, value: 185 },
            { score: 20, value: 180 },
            { score: 10, value: 175 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 270 },
            { score: 95, value: 265 },
            { score: 90, value: 260 },
            { score: 85, value: 253 },
            { score: 80, value: 245 },
            { score: 78, value: 241 },
            { score: 76, value: 237 },
            { score: 74, value: 233 },
            { score: 72, value: 229 },
            { score: 70, value: 225 },
            { score: 68, value: 221 },
            { score: 66, value: 217 },
            { score: 64, value: 213 },
            { score: 62, value: 209 },
            { score: 60, value: 205 },
            { score: 50, value: 200 },
            { score: 40, value: 195 },
            { score: 30, value: 190 },
            { score: 20, value: 185 },
            { score: 10, value: 180 },
            { score: 0, value: 0 }
        ]
    },
    // 女生立定跳远标准（厘米）
    female: {
        // 高一、高二、高三的立定跳远范围和对应分数
        grade1: [
            { score: 100, value: 204 },
            { score: 95, value: 198 },
            { score: 90, value: 192 },
            { score: 85, value: 185 },
            { score: 80, value: 178 },
            { score: 78, value: 175 },
            { score: 76, value: 172 },
            { score: 74, value: 169 },
            { score: 72, value: 166 },
            { score: 70, value: 163 },
            { score: 68, value: 160 },
            { score: 66, value: 157 },
            { score: 64, value: 154 },
            { score: 62, value: 151 },
            { score: 60, value: 148 },
            { score: 50, value: 144 },
            { score: 40, value: 139 },
            { score: 30, value: 134 },
            { score: 20, value: 129 },
            { score: 10, value: 124 },
            { score: 0, value: 0 }
        ],
        grade2: [
            { score: 100, value: 205 },
            { score: 95, value: 199 },
            { score: 90, value: 193 },
            { score: 85, value: 186 },
            { score: 80, value: 179 },
            { score: 78, value: 176 },
            { score: 76, value: 173 },
            { score: 74, value: 170 },
            { score: 72, value: 167 },
            { score: 70, value: 164 },
            { score: 68, value: 161 },
            { score: 66, value: 158 },
            { score: 64, value: 155 },
            { score: 62, value: 152 },
            { score: 60, value: 149 },
            { score: 50, value: 145 },
            { score: 40, value: 140 },
            { score: 30, value: 135 },
            { score: 20, value: 130 },
            { score: 10, value: 125 },
            { score: 0, value: 0 }
        ],
        grade3: [
            { score: 100, value: 206 },
            { score: 95, value: 200 },
            { score: 90, value: 194 },
            { score: 85, value: 187 },
            { score: 80, value: 180 },
            { score: 78, value: 177 },
            { score: 76, value: 174 },
            { score: 74, value: 171 },
            { score: 72, value: 168 },
            { score: 70, value: 165 },
            { score: 68, value: 162 },
            { score: 66, value: 159 },
            { score: 64, value: 156 },
            { score: 62, value: 153 },
            { score: 60, value: 150 },
            { score: 50, value: 145 },
            { score: 40, value: 140 },
            { score: 30, value: 135 },
            { score: 20, value: 130 },
            { score: 10, value: 125 },
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
 * 计算立定跳远得分
 * @param {number} distance - 立定跳远距离，单位：厘米
 * @param {string} gender - 性别，'male'或'female'
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns example: { distance: 19.4, score: 90, level: "良好" }
 */
function calculateStandingLongJumpScore(distance, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    // 获取对应性别和年级的立定跳远标准
    const gradeKey = `grade${grade}`;
    const standards = standingLongJumpStandard[gender][gradeKey];
    
    // 计算得分
    let score = 0;
    let level = '';

    for (let i = 0; i < standards.length - 1; i++) {
        if (distance >= standards[i].value) {
            score = standards[i].score;
            break;
        }
    }
    
    // 距离小于所有标准，则给最低分
    if (score === 0 && standards.length > 0) {
        score = standards[standards.length - 1].score;
    }
    
    // 确定等级
    if (score >= standingLongJumpStandard.levels.excellent.min) {
        level = standingLongJumpStandard.levels.excellent.desc;
    } else if (score >= standingLongJumpStandard.levels.good.min) {
        level = standingLongJumpStandard.levels.good.desc;
    } else if (score >= standingLongJumpStandard.levels.pass.min) {
        level = standingLongJumpStandard.levels.pass.desc;
    } else {
        level = standingLongJumpStandard.levels.fail.desc;
    }
    
    return {
        distance,
        score,
        level
    };
}


module.exports = calculateStandingLongJumpScore;

// console.log("男生高一示例 (250厘米):", calculateStandingLongJumpScore(250, 'male', 1));
// console.log("女生高三示例 (187厘米):", calculateStandingLongJumpScore(187, 'female', 3)); 