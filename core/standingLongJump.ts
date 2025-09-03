import { Gender, Grade, CalculateResult, TestStandard } from "./types";

// 立定跳远标准数据
const standingLongJumpStandard: TestStandard = {
  // 男生立定跳远标准（厘米）
  male: {
    // 高一、高二、高三的立定跳远范围和对应分数
    grade1: [
      { score: 100, value: 270 },
      { score: 95, value: 265 },
      { score: 90, value: 260 },
      { score: 85, value: 250 },
      { score: 80, value: 240 },
      { score: 78, value: 235 },
      { score: 76, value: 230 },
      { score: 74, value: 225 },
      { score: 72, value: 220 },
      { score: 70, value: 215 },
      { score: 68, value: 210 },
      { score: 66, value: 205 },
      { score: 64, value: 200 },
      { score: 62, value: 195 },
      { score: 60, value: 190 },
      { score: 50, value: 185 },
      { score: 40, value: 180 },
      { score: 30, value: 175 },
      { score: 20, value: 170 },
      { score: 10, value: 165 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 275 },
      { score: 95, value: 270 },
      { score: 90, value: 265 },
      { score: 85, value: 255 },
      { score: 80, value: 245 },
      { score: 78, value: 240 },
      { score: 76, value: 235 },
      { score: 74, value: 230 },
      { score: 72, value: 225 },
      { score: 70, value: 220 },
      { score: 68, value: 215 },
      { score: 66, value: 210 },
      { score: 64, value: 205 },
      { score: 62, value: 200 },
      { score: 60, value: 195 },
      { score: 50, value: 190 },
      { score: 40, value: 185 },
      { score: 30, value: 180 },
      { score: 20, value: 175 },
      { score: 10, value: 170 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 280 },
      { score: 95, value: 275 },
      { score: 90, value: 270 },
      { score: 85, value: 260 },
      { score: 80, value: 250 },
      { score: 78, value: 245 },
      { score: 76, value: 240 },
      { score: 74, value: 235 },
      { score: 72, value: 230 },
      { score: 70, value: 225 },
      { score: 68, value: 220 },
      { score: 66, value: 215 },
      { score: 64, value: 210 },
      { score: 62, value: 205 },
      { score: 60, value: 200 },
      { score: 50, value: 195 },
      { score: 40, value: 190 },
      { score: 30, value: 185 },
      { score: 20, value: 180 },
      { score: 10, value: 175 },
      { score: 0, value: 0 },
    ],
  },
  // 女生立定跳远标准（厘米）
  female: {
    // 高一、高二、高三的立定跳远范围和对应分数
    grade1: [
      { score: 100, value: 207 },
      { score: 95, value: 202 },
      { score: 90, value: 197 },
      { score: 85, value: 188 },
      { score: 80, value: 179 },
      { score: 78, value: 174 },
      { score: 76, value: 169 },
      { score: 74, value: 164 },
      { score: 72, value: 159 },
      { score: 70, value: 154 },
      { score: 68, value: 149 },
      { score: 66, value: 144 },
      { score: 64, value: 139 },
      { score: 62, value: 134 },
      { score: 60, value: 129 },
      { score: 50, value: 124 },
      { score: 40, value: 119 },
      { score: 30, value: 114 },
      { score: 20, value: 109 },
      { score: 10, value: 104 },
      { score: 0, value: 0 },
    ],
    grade2: [
      { score: 100, value: 209 },
      { score: 95, value: 204 },
      { score: 90, value: 199 },
      { score: 85, value: 190 },
      { score: 80, value: 181 },
      { score: 78, value: 176 },
      { score: 76, value: 171 },
      { score: 74, value: 166 },
      { score: 72, value: 161 },
      { score: 70, value: 156 },
      { score: 68, value: 151 },
      { score: 66, value: 146 },
      { score: 64, value: 141 },
      { score: 62, value: 136 },
      { score: 60, value: 131 },
      { score: 50, value: 126 },
      { score: 40, value: 121 },
      { score: 30, value: 116 },
      { score: 20, value: 111 },
      { score: 10, value: 106 },
      { score: 0, value: 0 },
    ],
    grade3: [
      { score: 100, value: 211 },
      { score: 95, value: 206 },
      { score: 90, value: 201 },
      { score: 85, value: 192 },
      { score: 80, value: 183 },
      { score: 78, value: 178 },
      { score: 76, value: 173 },
      { score: 74, value: 168 },
      { score: 72, value: 163 },
      { score: 70, value: 158 },
      { score: 68, value: 153 },
      { score: 66, value: 148 },
      { score: 64, value: 143 },
      { score: 62, value: 138 },
      { score: 60, value: 133 },
      { score: 50, value: 128 },
      { score: 40, value: 123 },
      { score: 30, value: 118 },
      { score: 20, value: 113 },
      { score: 10, value: 108 },
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
 * 计算立定跳远得分
 * @param cm - 立定跳远距离（厘米）
 * @param gender - 性别
 * @param grade - 年级，1表示高一，2表示高二，3表示高三
 * @returns 分数和等级信息
 */
export function calculateStandingLongJumpScore(
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

  if (typeof cm !== "number" || cm < 0) {
    throw new Error("距离必须是一个非负数");
  }

  // 获取对应性别和年级的标准
  const gradeKey =
    `grade${grade}` as keyof typeof standingLongJumpStandard.male;
  const standards = standingLongJumpStandard[gender][gradeKey];

  // 计算得分（立定跳远距离越长分数越高）
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

export default calculateStandingLongJumpScore;
