// 中间件导入和导出
import {
  authenticate,
  requireAdmin,
  requireClass,
  checkClassAccess,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken
} from './auth';

// 导出所有中间件
export {
  authenticate,
  requireAdmin,
  requireClass,
  checkClassAccess,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken
};

// 默认导出认证中间件
export default {
  authenticate,
  requireAdmin,
  requireClass,
  checkClassAccess,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken
};