import jwt, { JwtPayload } from 'jsonwebtoken';
import type { UserProfile, JWTPayload } from '../types/auth';

// JWT 配置
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'; // 15分钟
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // 7天

/**
 * 生成 Access Token
 */
export function generateAccessToken(user: UserProfile): string {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  } as jwt.SignOptions);
}

/**
 * 生成 Refresh Token
 */
export function generateRefreshToken(user: UserProfile): string {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  } as jwt.SignOptions);
}

/**
 * 验证 Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 验证 Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 从 Access Token 中提取用户信息
 */
export function getUserFromToken(token: string): UserProfile | null {
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    username: payload.username,
    role: payload.role,
    status: 'active' // 默认状态，实际应该从数据库获取
  };
}

/**
 * 获取 Access Token 的过期时间（秒）
 */
export function getAccessTokenExpiresIn(): number {
  // 解析过期时间字符串，返回秒数
  const match = ACCESS_TOKEN_EXPIRES_IN.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 900; // 默认15分钟
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}
