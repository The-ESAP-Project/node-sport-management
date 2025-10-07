import { UserRole, UserStatus, Gender, SportItem, ScoreDirection } from './enums';

// 通用API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
}

// 分页响应
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  name?: string;
  password: string;
  role: UserRole;
  className?: string;
  grade?: string;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  user: Omit<User, 'password'>;
  expiresIn: string;
}

// 班级相关类型
export interface ClassInfo {
  id: number;
  classID: number;
  className: string;
  grade?: string;
  department?: string;
  academicYear: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 学生相关类型（类似之前的StudentInfo）
export interface Student {
  id: number;
  StuRegisterNumber: string;
  StuName: string;
  StuGender: '0' | '1'; // 1男，0女
  StuNation: number;
  StuBirth: string;
  classID: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Excel导入学生数据格式
export interface StudentUploadData {
  StuRegisterNumber: string;
  StuName: string;
  StuGender: '0' | '1';
  StuNation: number;
  StuBirth: string;
  className: string;
  // 体测数据
  height?: number;
  weight?: number;
  vitalCapacity?: number;
  fiftyRun?: number;
  standingLongJump?: number;
  sitAndReach?: number;
  eightHundredRun?: number;
  oneThousandRun?: number;
  sitUp?: number;
  pullUp?: number;
}

export interface StudentPreviewResponse {
  previewId: string;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    className: string;
  };
  preview: Array<StudentUploadData & { row: number; errors: string[] }>;
  errors: Array<{ row: number; errors: string[] }>;
}

// 体测数据相关类型（宽表设计）
export interface SportData {
  id: number;
  studentID: number;
  year: number;
  gradeID: number;
  classID: number;
  height?: number;
  weight?: number;
  vitalCapacity?: number;
  fiftyRun?: number;
  standingLongJump?: number;
  sitAndReach?: number;
  eightHundredRun?: number;
  oneThousandRun?: number;
  sitUp?: number;
  pullUp?: number;
  totalScore?: number;
  classRank?: number;
  gradeRank?: number;
  created_at: Date;
  updated_at: Date;
}

// 评分标准相关类型
export interface Standard {
  id: number;
  name: string;
  year: number;
  version: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StandardRule {
  id: number;
  standard_id: number;
  item: SportItem;
  gender: '0' | '1';
  unit: string;
  weight: number;
  direction: ScoreDirection;
  ranges: Array<{
    min: number | null;
    max: number | null;
    score: number;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface StandardWithRules extends Standard {
  items: Array<{
    item: SportItem;
    itemName: string;
    gender: '0' | '1';
    unit: string;
    weight: number;
    direction: ScoreDirection;
    ranges: Array<{
      min: number | null;
      max: number | null;
      score: number;
    }>;
  }>;
}

// 学生成绩详情
export interface StudentScoreDetail {
  student: Student;
  currentYear: {
    year: number;
    totalScore: number;
    classRank: number;
    gradeRank: number;
    items: Array<{
      item: SportItem;
      itemName: string;
      rawValue: number;
      score: number;
      unit: string;
    }>;
  };
  history: Array<{
    year: number;
    totalScore: number;
    classRank: number;
    gradeRank: number;
  }>;
}

// 数据分析相关类型
export interface AnalysisOverview {
  scope: 'class' | 'grade' | 'school';
  target: string;
  year: number;
  summary: {
    totalStudents: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
    passRate: number;
  };
  distribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface TrendAnalysis {
  trends: {
    years: number[];
    avgScores: number[];
    passRates: number[];
  };
  itemTrends: Array<{
    item: SportItem;
    itemName: string;
    data: number[];
  }>;
}

// 系统配置类型
export interface SystemConfig {
  uploadDeadline: Date;
  currentYear: number;
  activeStandardId: number;
  systemStatus: 'normal' | 'maintenance';
}

// JWT Payload类型
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  className?: string;
  grade?: string;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

// Express Request扩展
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}