// 错误码定义 - 与前端保持一致
export enum ErrorCode {
  // 成功
  Success = 0,

  // 通用错误
  BadRequest = 1000, // 错误的请求
  Unauthorized = 1003, // 未授权访问
  NotFound = 1004, // 未找到资源
  Conflict = 1009, // 冲突 (资源已存在)
  InternalServerError = 1005, // 内部服务器错误

  // Auth 错误
  AuthFailed = 2000, // 身份验证失败

  // 扩展错误码 (后端特有)
  Forbidden = 1006, // 权限不足
  ValidationError = 1007, // 验证失败
  DatabaseError = 1008, // 数据库错误
  TokenExpired = 1010, // Token 已过期
  TokenInvalid = 1011, // Token 无效
  UserInactive = 1012, // 用户未激活
  InsufficientPermissions = 1013, // 权限不足
}

// 错误信息映射
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.Success]: 'Success',
  [ErrorCode.BadRequest]: 'Bad Request',
  [ErrorCode.Unauthorized]: 'Unauthorized',
  [ErrorCode.NotFound]: 'Not Found',
  [ErrorCode.Conflict]: 'Conflict',
  [ErrorCode.InternalServerError]: 'Internal Server Error',
  [ErrorCode.AuthFailed]: 'Authentication failed',
  [ErrorCode.Forbidden]: 'Forbidden',
  [ErrorCode.ValidationError]: 'Validation failed',
  [ErrorCode.DatabaseError]: 'Database operation failed',
  [ErrorCode.TokenExpired]: 'Token has expired',
  [ErrorCode.TokenInvalid]: 'Token is invalid',
  [ErrorCode.UserInactive]: 'User account is inactive',
  [ErrorCode.InsufficientPermissions]: 'Insufficient permissions',
};
