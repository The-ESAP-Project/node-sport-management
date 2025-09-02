import { Gender, Grade, CalculateResult, TestStandard } from "./types";

// 坐位体前屈标准数据
const sitAndReachStandard: TestStandard = {
  // 男生坐位体前屈标准（厘米）
  male: {
    // 高一、高二、高三的坐位体前屈范围和对应分数
    grade1: [
      { score: 100, value: 23.6 },
      { score: 95, value: 21.5 },
      { score: 90, value: 19.4 },
      { score: 85, value: 17.2 },
      { score: 80, value: 15.0 },
      { score: 78, value: 13.6 },
      { score: 76, value: 12.2 },
      { score: 74, value: 10.8 },
      { score: 72, value: 9.4 },
      { score: 70, value: 8.0 },
      { score: 68, value: 6.6 },
      { score: 66, value: 5.2 },
      { score: 64, value: 3.8 },
      { score: 62, value: 2.4 },
      { score: 60, value: 1.0 },
      { score: 50, value: 0.0 },
      { score: 40, value: -1.0 },
      { score: 30, value: -2.0 },
      { score: 20, value: -3.0 },
      { score: 10, value: -4.0 },
      { score: 0, value: -99 },
    ],
    grade2: [
      { score: 100, value: 24.3 },
      { score: 95, value: 22.4 },
      { score: 90, value: 20.5 },
      { score: 85, value: 18.3 },
      { score: 80, value: 16.1 },
      { score: 78, value: 14.7 },
      { score: 76, value: 13.3 },
      { score: 74, value: 11.9 },
      { score: 72, value: 10.5 },
      { score: 70, value: 9.1 },
      { score: 68, value: 7.7 },
      { score: 66, value: 6.3 },
      { score: 64, value: 4.9 },
      { score: 62, value: 3.5 },
      { score: 60, value: 2.1 },
      { score: 50, value: 1.1 },
      { score: 40, value: 0.1 },
      { score: 30, value: -0.9 },
      { score: 20, value: -1.9 },
      { score: 10, value: -2.9 },
      { score: 0, value: -99 },
    ],
    grade3: [
      { score: 100, value: 25.0 },
      { score: 95, value: 23.3 },
      { score: 90, value: 21.6 },
      { score: 85, value: 19.4 },
      { score: 80, value: 17.2 },
      { score: 78, value: 15.8 },
      { score: 76, value: 14.4 },
      { score: 74, value: 13.0 },
      { score: 72, value: 11.6 },
      { score: 70, value: 10.2 },
      { score: 68, value: 8.8 },
      { score: 66, value: 7.4 },
      { score: 64, value: 6.0 },
      { score: 62, value: 4.6 },
      { score: 60, value: 3.2 },
      { score: 50, value: 2.2 },
      { score: 40, value: 1.2 },
      { score: 30, value: 0.2 },
      { score: 20, value: -0.8 },
      { score: 10, value: -1.8 },
      { score: 0, value: -99 },
    ],
  },
  // 女生坐位体前屈标准（厘米）
  female: {
    // 高一、高二、高三的坐位体前屈范围和对应分数
    grade1: [
      { score: 100, value: 24.5 },
      { score: 95, value: 22.5 },
      { score: 90, value: 20.5 },
      { score: 85, value: 18.3 },
      { score: 80, value: 16.1 },
      { score: 78, value: 14.7 },
      { score: 76, value: 13.3 },
      { score: 74, value: 11.9 },
      { score: 72, value: 10.5 },
      { score: 70, value: 9.1 },
      { score: 68, value: 7.7 },
      { score: 66, value: 6.3 },
      { score: 64, value: 4.9 },
      { score: 62, value: 3.5 },
      { score: 60, value: 2.1 },
      { score: 50, value: 1.1 },
      { score: 40, value: 0.1 },
      { score: 30, value: -0.9 },
      { score: 20, value: -1.9 },
      { score: 10, value: -2.9 },
      { score: 0, value: -99 },
    ],
    grade2: [
      { score: 100, value: 25.2 },
      { score: 95, value: 23.4 },
      { score: 90, value: 21.6 },
      { score: 85, value: 19.4 },
      { score: 80, value: 17.2 },
      { score: 78, value: 15.8 },
      { score: 76, value: 14.4 },
      { score: 74, value: 13.0 },
      { score: 72, value: 11.6 },
      { score: 70, value: 10.2 },
      { score: 68, value: 8.8 },
      { score: 66, value: 7.4 },
      { score: 64, value: 6.0 },
      { score: 62, value: 4.6 },
      { score: 60, value: 3.2 },
      { score: 50, value: 2.2 },
      { score: 40, value: 1.2 },
      { score: 30, value: 0.2 },
      { score: 20, value: -0.8 },
      { score: 10, value: -1.8 },
      { score: 0, value: -99 },
    ],
    grade3: [
      { score: 100, value: 25.9 },
      { score: 95, value: 24.3 },
      { score: 90, value: 22.7 },
      { score: 85, value: 20.5 },
      { score: 80, value: 18.3 },
      { score: 78, value: 16.9 },
      { score: 76, value: 15.5 },
      { score: 74, value: 14.1 },
      { score: 72, value: 12.7 },
      { score: 70, value: 11.3 },
      { score: 68, value: 9.9 },
      { score: 66, value: 8.5 },
      { score: 64, value: 7.1 },
      { score: 62, value: 5.7 },
      { score: 60, value: 4.3 },
      { score: 50, value: 3.3 },
      { score: 40, value: 2.3 },
      { score: 30, value: 1.3 },
      { score: 20, value: 0.3 },
      { score: 10, value: -0.7 },
      { score: 0, value: -99 },
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
 * 计算坐位体前屈得分
 * @param cm - 坐位体前屈距离（厘米）
 * @param gender - 性别
 * @param grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns 分数和等级信息
 */
export function calculateSitAndReachScore(
  cm: number,
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

  if (typeof cm !== "number") {
    throw new Error("距离必须是一个数字");
  }

  // 获取对应性别和年级的标准
  const gradeKey = `grade${grade}` as keyof typeof sitAndReachStandard.male;
  const standards = sitAndReachStandard[gender][gradeKey];

  // 计算得分（坐位体前屈距离越长分数越高）
  let score = 0;

  for (let i = 0; i < standards.length - 1; i++) {
    if (cm >= standards[i].value) {
      score = standards[i].score;
      break;
    }
  }

  // 距离低于所有标准，则给最低分
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

export default calculateSitAndReachScore;
