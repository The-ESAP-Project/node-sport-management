const jwt = require('jsonwebtoken');

async function jwtParser(req, res, next) {
    const requestPath = req.originalUrl;
    const deployRoute = process.env.API_BASE_ROUTE || '';

    if(requestPath.startsWith(`${deployRoute}/auth/`)){
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ code: -1, message: 'Authorization token missing', data: null });
    }

    try {
        
        if ( jwt.verify(token, process.env.JWT_SECRET) === false) {
            return res.status(401).json({ code: -1, message: 'Invalid token', data: null });
        }

        // 解码 token 获取用户信息
        const decoded = jwt.decode(token);
        req.user = decoded;

        const { userID, username, grade, className } = decoded;

        if ( !userID || !username || !grade || !className) {
            return res.status(401).json({ code: -1, message: 'Invalid token structure', data: null });
        }

        // 如果没有权限访问该路径，则返回 403 Forbidden
        return res.status(403).json({ code: -1, message: 'Access denied', data: null });
    } catch (error) {
        return res.status(401).json({ code:-1 , message: 'Unauthorized - Token verification failed', data: null });
    }
}

// 将中间件导出
module.exports = jwtParser;
