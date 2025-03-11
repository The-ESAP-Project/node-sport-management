// 长跑标准数据（时间以秒为单位存储）
const enduranceRunStandard = {
    // 男生长跑标准（分:秒）
    male: {
        // 高一、高二、高三的长跑范围和对应分数
        grade1: [
            { score: 100, value: 210 }, // 3'30"
            { score: 95, value: 215 },  // 3'35"
            { score: 90, value: 220 },  // 3'40"
            { score: 85, value: 227 },  // 3'47"
            { score: 80, value: 235 },  // 3'55"
            { score: 78, value: 240 },  // 4'00"
            { score: 76, value: 245 },  // 4'05"
            { score: 74, value: 250 },  // 4'10"
            { score: 72, value: 255 },  // 4'15"
            { score: 70, value: 260 },  // 4'20"
            { score: 68, value: 265 },  // 4'25"
            { score: 66, value: 270 },  // 4'30"
            { score: 64, value: 275 },  // 4'35"
            { score: 62, value: 280 },  // 4'40"
            { score: 60, value: 285 },  // 4'45"
            { score: 50, value: 305 },  // 5'05"
            { score: 40, value: 320 },  // 5'20"
            { score: 30, value: 345 },  // 5'45"
            { score: 20, value: 385 },  // 6'25"
            { score: 10, value: 420 },  // 7'00"
            { score: 0, value: 999 }    // 超过最大时间
        ],
        grade2: [
            { score: 100, value: 205 }, // 3'25"
            { score: 95, value: 210 },  // 3'30"
            { score: 90, value: 215 },  // 3'35"
            { score: 85, value: 222 },  // 3'42"
            { score: 80, value: 230 },  // 3'50"
            { score: 78, value: 235 },  // 3'55"
            { score: 76, value: 240 },  // 4'00"
            { score: 74, value: 245 },  // 4'05"
            { score: 72, value: 250 },  // 4'10"
            { score: 70, value: 255 },  // 4'15"
            { score: 68, value: 260 },  // 4'20"
            { score: 66, value: 265 },  // 4'25"
            { score: 64, value: 270 },  // 4'30"
            { score: 62, value: 275 },  // 4'35"
            { score: 60, value: 280 },  // 4'40"
            { score: 50, value: 300 },  // 5'00"
            { score: 40, value: 315 },  // 5'15"
            { score: 30, value: 335 },  // 5'35"
            { score: 20, value: 380 },  // 6'20"
            { score: 10, value: 415 },  // 6'55"
            { score: 0, value: 999 }    // 超过最大时间
        ],
        grade3: [
            { score: 100, value: 200 }, // 3'20"
            { score: 95, value: 205 },  // 3'25"
            { score: 90, value: 210 },  // 3'30"
            { score: 85, value: 217 },  // 3'37"
            { score: 80, value: 225 },  // 3'45"
            { score: 78, value: 230 },  // 3'50"
            { score: 76, value: 235 },  // 3'55"
            { score: 74, value: 240 },  // 4'00"
            { score: 72, value: 245 },  // 4'05"
            { score: 70, value: 250 },  // 4'10"
            { score: 68, value: 255 },  // 4'15"
            { score: 66, value: 260 },  // 4'20"
            { score: 64, value: 265 },  // 4'25"
            { score: 62, value: 270 },  // 4'30"
            { score: 60, value: 275 },  // 4'35"
            { score: 50, value: 295 },  // 4'55"
            { score: 40, value: 310 },  // 5'10"
            { score: 30, value: 330 },  // 5'30"
            { score: 20, value: 375 },  // 6'15"
            { score: 10, value: 410 },  // 6'50"
            { score: 0, value: 999 }    // 超过最大时间
        ]
    },
    // 女生长跑标准（分:秒）
    female: {
        // 高一、高二、高三的长跑范围和对应分数
        grade1: [
            { score: 100, value: 204 }, // 3'24"
            { score: 95, value: 208 },  // 3'28"
            { score: 90, value: 214 },  // 3'34"
            { score: 85, value: 221 },  // 3'41"
            { score: 80, value: 228 },  // 3'48"
            { score: 78, value: 230 },  // 3'50"
            { score: 76, value: 238 },  // 3'58"
            { score: 74, value: 243 },  // 4'03"
            { score: 72, value: 248 },  // 4'08"
            { score: 70, value: 251 },  // 4'11"
            { score: 68, value: 258 },  // 4'18"
            { score: 66, value: 263 },  // 4'23"
            { score: 64, value: 268 },  // 4'28"
            { score: 62, value: 273 },  // 4'33"
            { score: 60, value: 278 },  // 4'38"
            { score: 50, value: 288 },  // 4'48"
            { score: 40, value: 300 },  // 5'00"
            { score: 30, value: 310 },  // 5'10"
            { score: 20, value: 320 },  // 5'20"
            { score: 10, value: 330 },  // 5'30"
            { score: 0, value: 999 }    // 超过最大时间
        ],
        grade2: [
            { score: 100, value: 202 }, // 3'22"
            { score: 95, value: 206 },  // 3'26"
            { score: 90, value: 212 },  // 3'32"
            { score: 85, value: 219 },  // 3'39"
            { score: 80, value: 226 },  // 3'46"
            { score: 78, value: 228 },  // 3'48"
            { score: 76, value: 236 },  // 3'56"
            { score: 74, value: 241 },  // 4'01"
            { score: 72, value: 246 },  // 4'06"
            { score: 70, value: 249 },  // 4'09"
            { score: 68, value: 256 },  // 4'16"
            { score: 66, value: 261 },  // 4'21"
            { score: 64, value: 266 },  // 4'26"
            { score: 62, value: 271 },  // 4'31"
            { score: 60, value: 276 },  // 4'36"
            { score: 50, value: 286 },  // 4'46"
            { score: 40, value: 298 },  // 4'58"
            { score: 30, value: 308 },  // 5'08"
            { score: 20, value: 318 },  // 5'18"
            { score: 10, value: 328 },  // 5'28"
            { score: 0, value: 999 }    // 超过最大时间
        ],
        grade3: [
            { score: 100, value: 200 }, // 3'20"
            { score: 95, value: 204 },  // 3'24"
            { score: 90, value: 210 },  // 3'30"
            { score: 85, value: 217 },  // 3'37"
            { score: 80, value: 224 },  // 3'44"
            { score: 78, value: 226 },  // 3'46"
            { score: 76, value: 234 },  // 3'54"
            { score: 74, value: 239 },  // 3'59"
            { score: 72, value: 244 },  // 4'04"
            { score: 70, value: 247 },  // 4'07"
            { score: 68, value: 254 },  // 4'14"
            { score: 66, value: 259 },  // 4'19"
            { score: 64, value: 264 },  // 4'24"
            { score: 62, value: 269 },  // 4'29"
            { score: 60, value: 274 },  // 4'34"
            { score: 50, value: 284 },  // 4'44"
            { score: 40, value: 296 },  // 4'56"
            { score: 30, value: 306 },  // 5'06"
            { score: 20, value: 316 },  // 5'16"
            { score: 10, value: 326 },  // 5'26"
            { score: 0, value: 999 }    // 超过最大时间
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
 * 计算长跑得分
 * @param {number} seconds - 完成时间（秒数）
 * @param {string} gender - 性别，'male'或'female'
 * @param {number} grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns example: { score: 90, level: "优秀" }
 */
function calculateEnduranceRunScore(seconds, gender = 'male', grade = 1) {
    // 参数验证
    if (!['male', 'female'].includes(gender)) {
        throw new Error('性别参数必须为"male"或"female"');
    }
    
    if (![1, 2, 3].includes(grade)) {
        throw new Error('年级参数必须为1、2或3，分别代表高一、高二、高三');
    }
    
    if (typeof seconds !== 'number' || seconds < 0) {
        throw new Error('时间必须是一个非负数');
    }
    
    // 获取对应性别和年级的标准
    const gradeKey = `grade${grade}`;
    const standards = enduranceRunStandard[gender][gradeKey];
    
    // 计算得分
    let score = 0;
    let level = '';

    for (let i = 0; i < standards.length - 1; i++) {
        if (seconds <= standards[i].value) {
            score = standards[i].score;
            break;
        }
    }
    
    // 时间超过所有标准，则给最低分
    if (score === 0 && standards.length > 0) {
        score = standards[standards.length - 1].score;
    }
    
    // 确定等级
    if (score >= enduranceRunStandard.levels.excellent.min) {
        level = enduranceRunStandard.levels.excellent.desc;
    } else if (score >= enduranceRunStandard.levels.good.min) {
        level = enduranceRunStandard.levels.good.desc;
    } else if (score >= enduranceRunStandard.levels.pass.min) {
        level = enduranceRunStandard.levels.pass.desc;
    } else {
        level = enduranceRunStandard.levels.fail.desc;
    }
    
    return {
        score,
        level
    };
}


module.exports = calculateEnduranceRunScore;


// console.log("男生高一长跑示例 (220秒 = 3'40\"):", calculateEnduranceRunScore(220, 'male', 1));
// console.log("女生高三长跑示例 (217秒 = 3'37\"):", calculateEnduranceRunScore(217, 'female', 3)); 