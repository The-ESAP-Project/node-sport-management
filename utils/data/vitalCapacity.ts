import { Gender, Grade, CalculateResult, TestStandard } from "./types";

// 肺活量标准数据
const vitalCapacityStandard: TestStandard = {
  // 男生肺活量标准（毫升）
  male: {
    // 高一、高二、高三的肺活量范围和对应分数
    grade1: [
      { score: 100, value: 5040 },
      { score: 95, value: 4800 },
      { score: 90, value: 4560 },
      { score: 85, value: 4180 },
      { score: 80, value: 3800 },
      { score: 78, value: 3610 },
      { score: 76, value: 3420 },
      { score: 74, value: 3230 },
      { score: 72, value: 3040 },
      { score: 70, value: 2850 },
      { score: 68, value: 2660 },
      { score: 66, value: 2470 },
      { score: 64, value: 2280 },
      { score: 62, value: 2090 },
      { score: 60, value: 1900 },
      { score: 50, value: 1710 },
      { score: 40, value: 1520 },
      { score: 30, value: 1330 },
      { score: 20, value: 1140 },
      { score: 10, value: 950 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 5160 },
      { score: 95, value: 4920 },
      { score: 90, value: 4680 },
      { score: 85, value: 4300 },
      { score: 80, value: 3920 },
      { score: 78, value: 3730 },
      { score: 76, value: 3540 },
      { score: 74, value: 3350 },
      { score: 72, value: 3160 },
      { score: 70, value: 2970 },
      { score: 68, value: 2780 },
      { score: 66, value: 2590 },
      { score: 64, value: 2400 },
      { score: 62, value: 2210 },
      { score: 60, value: 2020 },
      { score: 50, value: 1830 },
      { score: 40, value: 1640 },
      { score: 30, value: 1450 },
      { score: 20, value: 1260 },
      { score: 10, value: 1070 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 5280 },
      { score: 95, value: 5040 },
      { score: 90, value: 4800 },
      { score: 85, value: 4420 },
      { score: 80, value: 4040 },
      { score: 78, value: 3850 },
      { score: 76, value: 3660 },
      { score: 74, value: 3470 },
      { score: 72, value: 3280 },
      { score: 70, value: 3090 },
      { score: 68, value: 2900 },
      { score: 66, value: 2710 },
      { score: 64, value: 2520 },
      { score: 62, value: 2330 },
      { score: 60, value: 2140 },
      { score: 50, value: 1950 },
      { score: 40, value: 1760 },
      { score: 30, value: 1570 },
      { score: 20, value: 1380 },
      { score: 10, value: 1190 },
      { score: 0, value: 0 },
    ],
  },
  // 女生肺活量标准（毫升）
  female: {
    // 高一、高二、高三的肺活量范围和对应分数
    grade1: [
      { score: 100, value: 3400 },
      { score: 95, value: 3250 },
      { score: 90, value: 3100 },
      { score: 85, value: 2850 },
      { score: 80, value: 2600 },
      { score: 78, value: 2475 },
      { score: 76, value: 2350 },
      { score: 74, value: 2225 },
      { score: 72, value: 2100 },
      { score: 70, value: 1975 },
      { score: 68, value: 1850 },
      { score: 66, value: 1725 },
      { score: 64, value: 1600 },
      { score: 62, value: 1475 },
      { score: 60, value: 1350 },
      { score: 50, value: 1225 },
      { score: 40, value: 1100 },
      { score: 30, value: 975 },
      { score: 20, value: 850 },
      { score: 10, value: 725 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 3450 },
      { score: 95, value: 3300 },
      { score: 90, value: 3150 },
      { score: 85, value: 2900 },
      { score: 80, value: 2650 },
      { score: 78, value: 2525 },
      { score: 76, value: 2400 },
      { score: 74, value: 2275 },
      { score: 72, value: 2150 },
      { score: 70, value: 2025 },
      { score: 68, value: 1900 },
      { score: 66, value: 1775 },
      { score: 64, value: 1650 },
      { score: 62, value: 1525 },
      { score: 60, value: 1400 },
      { score: 50, value: 1275 },
      { score: 40, value: 1150 },
      { score: 30, value: 1025 },
      { score: 20, value: 900 },
      { score: 10, value: 775 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 3500 },
      { score: 95, value: 3350 },
      { score: 90, value: 3200 },
      { score: 85, value: 2950 },
      { score: 80, value: 2700 },
      { score: 78, value: 2575 },
      { score: 76, value: 2450 },
      { score: 74, value: 2325 },
      { score: 72, value: 2200 },
      { score: 70, value: 2075 },
      { score: 68, value: 1950 },
      { score: 66, value: 1825 },
      { score: 64, value: 1700 },
      { score: 62, value: 1575 },
      { score: 60, value: 1450 },
      { score: 50, value: 1325 },
      { score: 40, value: 1200 },
      { score: 30, value: 1075 },
      { score: 20, value: 950 },
      { score: 10, value: 825 },
      { score: 0, value: 0 },
    ],
  },
};

// 等级描述
const levels = {
  excellent: { min: 85, desc: "优秀" as const },
  good: { min: 70, desc: "良好" as const },
  pass: { min: 60, desc: "及格" as const },
  fail: { min: 0, desc: "不及格" as const },
};

/**
 * 计算肺活量得分
 * @param ml - 肺活量（毫升）
 * @param gender - 性别
 * @param grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns 分数和等级信息
 */
export function calculateVitalCapacityScore(
  ml: number,
  gender: Gender = "male",
  grade: Grade = 1
): CalculateResult | null {
  // 参数验证
  if (!["male", "female"].includes(gender)) {
    throw new Error('性别参数必须为"male"或"female"');
  }

  if (![1, 2, 3].includes(grade)) {
    throw new Error("年级参数必须为1、2或3，分别代表高一、高二、高三");
  }

  if (typeof ml !== "number" || ml < 0) {
    throw new Error("肺活量必须是一个非负数");
  }

  // 获取对应性别和年级的标准
  const gradeKey = `grade${grade}` as keyof typeof vitalCapacityStandard.male;
  const standards = vitalCapacityStandard[gender][gradeKey];

  // 计算得分（肺活量越大分数越高）
  let score = 0;

  for (let i = 0; i < standards.length - 1; i++) {
    if (ml >= standards[i].value) {
      score = standards[i].score;
      break;
    }
  }

  // 肺活量低于所有标准，则给最低分
  if (score === 0 && standards.length > 0) {
    score = standards[standards.length - 1].score;
  }

  // 确定等级
  let level: string;
  if (score >= levels.excellent.min) {
    level = levels.excellent.desc;
  } else if (score >= levels.good.min) {
    level = levels.good.desc;
  } else if (score >= levels.pass.min) {
    level = levels.pass.desc;
  } else {
    level = levels.fail.desc;
  }

  return {
    score,
    level: level as CalculateResult["level"],
  };
}

export default calculateVitalCapacityScore;
