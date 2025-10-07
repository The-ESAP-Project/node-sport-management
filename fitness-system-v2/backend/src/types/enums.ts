// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  CLASS = 'class'
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// 性别枚举（保持与之前一致）
export enum Gender {
  MALE = '1',   // 男
  FEMALE = '0'  // 女
}

// 体测项目枚举（与SportData字段对应）
export enum SportItem {
  HEIGHT = 'height',
  WEIGHT = 'weight', 
  VITAL_CAPACITY = 'vitalCapacity',
  FIFTY_RUN = 'fiftyRun',
  STANDING_LONG_JUMP = 'standingLongJump',
  SIT_AND_REACH = 'sitAndReach',
  EIGHT_HUNDRED_RUN = 'eightHundredRun',
  ONE_THOUSAND_RUN = 'oneThousandRun',
  SIT_UP = 'sitUp',
  PULL_UP = 'pullUp'
}

// 评分方向枚举
export enum ScoreDirection {
  HIGHER_BETTER = 'higher_better',
  LOWER_BETTER = 'lower_better'
}