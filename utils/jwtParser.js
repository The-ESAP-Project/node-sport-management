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

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        if (!decoded) {
            return res.status(401).json({ code: -1, message: 'Unauthorized - Token verification failed', data: null });
        }

        req.user = decoded
        const { username, role } = decoded;

        if ( !username || !role ) {
            return res.status(401).json({ code: -1, message: 'Invalid token structure', data: null });
        }

        if ( requestPath.startsWith(`${deployRoute}/user/`)) {
            return next();
        } else if ( requestPath.startsWith(`${deployRoute}/superadmin/`) && decoded.role === 'superadmin') {
            return next();
        } else {
            return res.status(403).json({ code: -1, message: 'Access denied', data: null });
        }
        
    } catch (error) {
        return res.status(401).json({ code:-1 , message: 'Unauthorized - Token verification failed', data: null });
    }
}

// 将中间件导出
module.exports = jwtParser;
