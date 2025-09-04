// 本文件使用Mock数据模拟数据库交互
import { Gender } from "./types";

// 常量配置
export const CONST_SIZE = 50; // 默认分页大小

// 学生原始数据接口
export interface StudentRawData {
  stu_id: string;
  name: string;
  gender: Gender;
  longRun?: number;
  shortRun?: number;
  sitAndReach?: number;
  longJump?: number;
  vitalCapacity?: number;
  sitUpAndPullUp?: number;
}

// 分页查询结果接口
export interface PagedResult<T> {
  data: T[];
  total: number;
}

// Mock 数据生成器
class MockDataGenerator {
  private static instance: MockDataGenerator;
  private mockStudents: Map<string, StudentRawData[]> = new Map(); // 按年份存储
  private mockGradeYears: Map<number, string[]> = new Map(); // 年级可用年份
  private mockStudentYears: Map<string, string[]> = new Map(); // 学生可用年份

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  private initializeMockData(): void {
    // 生成测试年份数据
    const years = ["2022", "2023", "2024"];

    // 为每个年级生成可用年份
    for (let grade = 1; grade <= 3; grade++) {
      // 只支持1-3年级（高一、高二、高三）
      this.mockGradeYears.set(grade, [...years]);
    }

    // 为每个年份生成学生数据
    years.forEach((year) => {
      const studentsForYear: StudentRawData[] = [];

      // 每个年级生成30-50个学生
      for (let grade = 1; grade <= 3; grade++) {
        // 只支持1-3年级（高一、高二、高三）
        const studentCount = 30 + Math.floor(Math.random() * 21); // 30-50人

        for (let i = 1; i <= studentCount; i++) {
          const studentId = `${year}${grade.toString().padStart(2, "0")}${i
            .toString()
            .padStart(3, "0")}`;
          const gender =
            Math.random() > 0.5 ? ("male" as Gender) : ("female" as Gender);

          studentsForYear.push(
            this.generateMockStudent(studentId, gender, grade, parseInt(year))
          );
        }
      }

      this.mockStudents.set(year, studentsForYear);
    });

    // 为每个学生生成可用年份（随机分配1-3年的数据）
    const allStudentIds = new Set<string>();
    this.mockStudents.forEach((students) => {
      students.forEach((student) => allStudentIds.add(student.stu_id));
    });

    allStudentIds.forEach((studentId) => {
      const availableYears: string[] = [];
      const baseYear = parseInt(studentId.substring(0, 4));

      // 根据学生ID生成一致的可用年份
      const yearCount = 1 + (studentId.charCodeAt(4) % 3); // 1-3年数据
      for (let i = 0; i < yearCount; i++) {
        const year = (baseYear + i).toString();
        if (years.includes(year)) {
          availableYears.push(year);
        }
      }

      this.mockStudentYears.set(studentId, availableYears);
    });
  }

  private generateMockStudent(
    stu_id: string,
    gender: Gender,
    grade: number,
    year: number
  ): StudentRawData {
    const isMale = gender === "male";
    const age = grade + 3; // 大概年龄

    // 根据性别和年龄生成合理的体测数据
    const baseScores = {
      // 长跑（秒）- 男生800米，女生800米
      longRun: isMale
        ? 200 + Math.random() * 80 + (grade - 1) * 10 // 200-280秒
        : 220 + Math.random() * 100 + (grade - 1) * 12, // 220-320秒

      // 50米跑（秒）
      shortRun: isMale
        ? 7.5 + Math.random() * 2.5 - (grade - 1) * 0.3 // 7.5-10秒，年级越高越快
        : 8.0 + Math.random() * 3.0 - (grade - 1) * 0.3, // 8.0-11秒

      // 坐位体前屈（厘米）
      sitAndReach: 5 + Math.random() * 20 + (isMale ? -2 : 3), // 女生柔韧性通常更好

      // 立定跳远（厘米）
      longJump: isMale
        ? 140 + Math.random() * 60 + (grade - 1) * 15 // 140-200厘米
        : 120 + Math.random() * 50 + (grade - 1) * 12, // 120-170厘米

      // 肺活量（毫升）
      vitalCapacity: isMale
        ? 2000 + Math.random() * 1500 + (grade - 1) * 200 // 2000-3500ml
        : 1600 + Math.random() * 1200 + (grade - 1) * 150, // 1600-2800ml

      // 仰卧起坐/引体向上（次）
      sitUpAndPullUp: isMale
        ? Math.floor(Math.random() * 15) + 5 + (grade - 1) * 2 // 引体向上 5-20次
        : Math.floor(Math.random() * 40) + 20 + (grade - 1) * 3, // 仰卧起坐 20-60次
    };

    // 添加年度波动（模拟学生进步或退步）
    const yearVariation = (year - 2022) * 0.1; // 每年有轻微变化
    const personalVariation = Math.random() * 0.2 - 0.1; // ±10% 个人波动

    return {
      stu_id,
      name: this.generateChineseName(gender),
      gender,
      longRun:
        Math.round(
          baseScores.longRun *
            (1 - yearVariation * 0.05 + personalVariation) *
            100
        ) / 100,
      shortRun:
        Math.round(
          baseScores.shortRun *
            (1 - yearVariation * 0.03 + personalVariation) *
            100
        ) / 100,
      sitAndReach:
        Math.round(
          baseScores.sitAndReach *
            (1 + yearVariation * 0.02 + personalVariation) *
            100
        ) / 100,
      longJump: Math.round(
        baseScores.longJump * (1 + yearVariation * 0.04 + personalVariation)
      ),
      vitalCapacity: Math.round(
        baseScores.vitalCapacity *
          (1 + yearVariation * 0.03 + personalVariation)
      ),
      sitUpAndPullUp: Math.round(
        baseScores.sitUpAndPullUp *
          (1 + yearVariation * 0.05 + personalVariation)
      ),
    };
  }

  private generateChineseName(gender: Gender): string {
    const surnames = [
      "李",
      "王",
      "张",
      "刘",
      "陈",
      "杨",
      "赵",
      "黄",
      "周",
      "吴",
      "徐",
      "孙",
      "胡",
      "朱",
      "高",
      "林",
      "何",
      "郭",
      "马",
      "罗",
    ];
    const maleNames = [
      "伟",
      "强",
      "磊",
      "军",
      "勇",
      "涛",
      "明",
      "超",
      "亮",
      "华",
      "建",
      "峰",
      "龙",
      "阳",
      "刚",
      "辉",
      "斌",
      "鹏",
      "飞",
      "宇",
    ];
    const femaleNames = [
      "丽",
      "娜",
      "敏",
      "静",
      "秀",
      "美",
      "雪",
      "莉",
      "红",
      "艳",
      "玲",
      "梅",
      "芳",
      "燕",
      "萍",
      "霞",
      "婷",
      "慧",
      "琳",
      "蕾",
    ];

    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const namePool = gender === "male" ? maleNames : femaleNames;
    const given = namePool[Math.floor(Math.random() * namePool.length)];

    // 30% 概率是双字名
    if (Math.random() < 0.3) {
      const secondChar = namePool[Math.floor(Math.random() * namePool.length)];
      return surname + given + secondChar;
    }

    return surname + given;
  }

  // 公共接口方法
  public getGradeAvailableYears(grade_id: number): string[] {
    return this.mockGradeYears.get(grade_id) || [];
  }

  public getStudentAvailableYears(stu_id: string): string[] {
    return this.mockStudentYears.get(stu_id) || [];
  }

  public getStudentData(
    grade_id: number,
    year: string,
    page: number,
    page_size: number
  ): PagedResult<StudentRawData> {
    const allStudents = this.mockStudents.get(year) || [];
    const gradeStudents = allStudents.filter((s) => {
      const studentGrade = parseInt(s.stu_id.substring(4, 6));
      return studentGrade === grade_id;
    });

    const start = (page - 1) * page_size;
    const end = start + page_size;
    const pageData = gradeStudents.slice(start, end);

    return {
      data: pageData,
      total: gradeStudents.length,
    };
  }

  public getStudentById(stu_id: string, year?: number): StudentRawData | null {
    const queryYear = (year || new Date().getFullYear()).toString();
    const students = this.mockStudents.get(queryYear) || [];
    return students.find((s) => s.stu_id === stu_id) || null;
  }

  public getStudentHistoryData(stu_id: string): StudentRawData[] {
    const availableYears = this.getStudentAvailableYears(stu_id);
    const historyData: StudentRawData[] = [];

    availableYears.forEach((year) => {
      const student = this.getStudentById(stu_id, parseInt(year));
      if (student) {
        historyData.push(student);
      }
    });

    return historyData.sort(
      (a, b) =>
        parseInt(a.stu_id.substring(0, 4)) - parseInt(b.stu_id.substring(0, 4))
    );
  }
}

// 获取 Mock 数据生成器实例
const mockGenerator = MockDataGenerator.getInstance();

/**
 * 获取指定年级可用数据的年份
 * @param grade_id 年级ID
 * @returns 可用年份数组
 */
export async function fetchAvailableYears(grade_id: number): Promise<string[]> {
  console.log(`[MOCK] 获取年级${grade_id}可用年份`);
  return mockGenerator.getGradeAvailableYears(grade_id);
}

/**
 * 获取指定年级可用数据的年份（别名函数）
 * @param grade_id 年级ID
 * @returns 可用年份数组
 */
export async function fetchGradeAvailableYears(
  grade_id: number
): Promise<string[]> {
  return await fetchAvailableYears(grade_id);
}

/**
 * 获取指定学生可用数据的年份
 * @param stu_id 学生ID
 * @returns 可用年份数组
 */
export async function fetchStudentAvailableYears(
  stu_id: string
): Promise<string[]> {
  console.log(`[MOCK] 获取学生${stu_id}可用年份`);
  return mockGenerator.getStudentAvailableYears(stu_id);
}

/**
 * 分页查询年级学生数据
 * @param grade_id 年级ID
 * @param year 年份
 * @param page 页码（从1开始）
 * @param page_size 每页大小
 * @returns 分页学生数据
 */
export async function fetchStudentData(
  grade_id: number,
  year: string,
  page: number,
  page_size: number = CONST_SIZE
): Promise<PagedResult<StudentRawData>> {
  console.log(
    `[MOCK] 获取年级${grade_id}在${year}年的学生数据，第${page}页，每页${page_size}条`
  );
  return mockGenerator.getStudentData(grade_id, year, page, page_size);
}

/**
 * 根据学生ID查询单个学生数据
 * @param stu_id 学生ID
 * @param year 年份（可选，默认为当前年份）
 * @returns 学生数据
 */
export async function fetchStudentById(
  stu_id: string,
  year?: number
): Promise<StudentRawData | null> {
  const queryYear = year || new Date().getFullYear();
  console.log(`[MOCK] 获取学生${stu_id}在${queryYear}年的数据`);
  return mockGenerator.getStudentById(stu_id, queryYear);
}
