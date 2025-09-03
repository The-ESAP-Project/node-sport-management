import { Gender, Grade, CalculateResult, TestStandard } from "./types";

// 仰卧起坐/引体向上标准数据
const sitUpAndPullUpStandard: TestStandard = {
  // 男生引体向上标准（次数）
  male: {
    // 高一、高二、高三的引体向上次数范围和对应分数
    grade1: [
      { score: 100, value: 17 },
      { score: 95, value: 16 },
      { score: 90, value: 15 },
      { score: 85, value: 14 },
      { score: 80, value: 13 },
      { score: 78, value: 12 },
      { score: 76, value: 11 },
      { score: 74, value: 10 },
      { score: 72, value: 9 },
      { score: 70, value: 8 },
      { score: 68, value: 7 },
      { score: 66, value: 6 },
      { score: 64, value: 5 },
      { score: 62, value: 4 },
      { score: 60, value: 3 },
      { score: 50, value: 2 },
      { score: 40, value: 1 },
      { score: 30, value: 1 },
      { score: 20, value: 1 },
      { score: 10, value: 1 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 18 },
      { score: 95, value: 17 },
      { score: 90, value: 16 },
      { score: 85, value: 15 },
      { score: 80, value: 14 },
      { score: 78, value: 13 },
      { score: 76, value: 12 },
      { score: 74, value: 11 },
      { score: 72, value: 10 },
      { score: 70, value: 9 },
      { score: 68, value: 8 },
      { score: 66, value: 7 },
      { score: 64, value: 6 },
      { score: 62, value: 5 },
      { score: 60, value: 4 },
      { score: 50, value: 3 },
      { score: 40, value: 2 },
      { score: 30, value: 1 },
      { score: 20, value: 1 },
      { score: 10, value: 1 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 19 },
      { score: 95, value: 18 },
      { score: 90, value: 17 },
      { score: 85, value: 16 },
      { score: 80, value: 15 },
      { score: 78, value: 14 },
      { score: 76, value: 13 },
      { score: 74, value: 12 },
      { score: 72, value: 11 },
      { score: 70, value: 10 },
      { score: 68, value: 9 },
      { score: 66, value: 8 },
      { score: 64, value: 7 },
      { score: 62, value: 6 },
      { score: 60, value: 5 },
      { score: 50, value: 4 },
      { score: 40, value: 3 },
      { score: 30, value: 2 },
      { score: 20, value: 1 },
      { score: 10, value: 1 },
      { score: 0, value: 0 },
    ],
  },
  // 女生仰卧起坐标准（次数）
  female: {
    // 高一、高二、高三的仰卧起坐次数范围和对应分数
    grade1: [
      { score: 100, value: 56 },
      { score: 95, value: 54 },
      { score: 90, value: 52 },
      { score: 85, value: 49 },
      { score: 80, value: 46 },
      { score: 78, value: 44 },
      { score: 76, value: 42 },
      { score: 74, value: 40 },
      { score: 72, value: 38 },
      { score: 70, value: 36 },
      { score: 68, value: 34 },
      { score: 66, value: 32 },
      { score: 64, value: 30 },
      { score: 62, value: 28 },
      { score: 60, value: 26 },
      { score: 50, value: 24 },
      { score: 40, value: 22 },
      { score: 30, value: 20 },
      { score: 20, value: 18 },
      { score: 10, value: 16 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 57 },
      { score: 95, value: 55 },
      { score: 90, value: 53 },
      { score: 85, value: 50 },
      { score: 80, value: 47 },
      { score: 78, value: 45 },
      { score: 76, value: 43 },
      { score: 74, value: 41 },
      { score: 72, value: 39 },
      { score: 70, value: 37 },
      { score: 68, value: 35 },
      { score: 66, value: 33 },
      { score: 64, value: 31 },
      { score: 62, value: 29 },
      { score: 60, value: 27 },
      { score: 50, value: 25 },
      { score: 40, value: 23 },
      { score: 30, value: 21 },
      { score: 20, value: 19 },
      { score: 10, value: 17 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 58 },
      { score: 95, value: 56 },
      { score: 90, value: 54 },
      { score: 85, value: 51 },
      { score: 80, value: 48 },
      { score: 78, value: 46 },
      { score: 76, value: 44 },
      { score: 74, value: 42 },
      { score: 72, value: 40 },
      { score: 70, value: 38 },
      { score: 68, value: 36 },
      { score: 66, value: 34 },
      { score: 64, value: 32 },
      { score: 62, value: 30 },
      { score: 60, value: 28 },
      { score: 50, value: 26 },
      { score: 40, value: 24 },
      { score: 30, value: 22 },
      { score: 20, value: 20 },
      { score: 10, value: 18 },
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
 * 计算仰卧起坐/引体向上得分
 * @param count - 完成次数
 * @param gender - 性别（男生为引体向上，女生为仰卧起坐）
 * @param grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns 分数和等级信息
 */
export function calculateSitUpAndPullUpScore(
  count: number,
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

  if (typeof count !== "number" || count < 0) {
    throw new Error("次数必须是一个非负整数");
  }

  // 获取对应性别和年级的标准
  const gradeKey = `grade${grade}` as keyof typeof sitUpAndPullUpStandard.male;
  const standards = sitUpAndPullUpStandard[gender][gradeKey];

  // 计算得分（次数越多分数越高）
  let score = 0;

  for (let i = 0; i < standards.length - 1; i++) {
    if (count >= standards[i].value) {
      score = standards[i].score;
      break;
    }
  }

  // 次数低于所有标准，则给最低分
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

export default calculateSitUpAndPullUpScore;
