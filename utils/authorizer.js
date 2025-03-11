function authorize(allowedRoles = []) {
    return (req, res, next) => {
      // 检查用户是否已通过JWT验证并挂载到req对象
      if (!req.user) {
        return res.status(401).json({ 
          code: -1, 
          message: 'Unauthorized - Authentication required', 
          data: null 
        });
      }
  
      // 从JWT解码的用户信息中获取角色
      const { role } = req.user;
  
      // 检查用户角色是否在允许的角色列表中
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return res.status(403).json({ 
          code: -1, 
          message: 'Forbidden - Insufficient permissions', 
          data: null 
        });
      }
  
      // 权限验证通过，继续执行后续中间件
      next();
    };
  }
  
  module.exports = authorize;