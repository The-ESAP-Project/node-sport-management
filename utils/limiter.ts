import {rateLimit, ipKeyGenerator} from 'express-rate-limit';
import { User } from '../models/UserModel';

const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  message: {
    code: -1,
    message: 'Too many requests from this IP, please try again after 5 minutes',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    code: -1,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => {
    if (req.user) {
      return req.user.id.toString();
    }
    // 直接使用 req.ip，express-rate-limit 会自动处理 IPv6
    return ipKeyGenerator(req.ip as string);
  },
  message: {
    code: -1,
    message: 'Rate limit exceeded for this user. Please try again later.',
    data: null
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  keyGenerator: (req) => {
    if (req.user) {
      return req.user.id.toString();
    }
    // 直接使用 req.ip，express-rate-limit 会自动处理 IPv6
    return ipKeyGenerator(req.ip as string);
  },
  message: {
    code: -1,
    message: 'Rate limit exceeded for this admin. Please try again later.',
    data: null
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

export { globalLimiter, authLimiter, userLimiter, adminLimiter };