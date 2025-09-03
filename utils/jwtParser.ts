import { verify, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { userLimiter, adminLimiter } from './limiter';
import { verifyAccessToken } from './jwt';
import type { JWTPayload } from '../types/auth';

async function jwtParser(req: Request, res: Response, next: NextFunction) {
    const requestPath = req.originalUrl;
    const API_BASE_ROUTE = process.env.API_BASE_ROUTE || '';

    if(requestPath.startsWith(`${API_BASE_ROUTE}/v1/auth/`)){
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ code: -1, message: 'Authorization token missing', data: null });
    }

    try {
        // 使用新的 JWT 验证函数
        const payload = verifyAccessToken(token);
        if (!payload) {
            return res.status(401).json({ code: -1, message: 'Unauthorized - Token verification failed', data: null });
        }

        // 将用户信息挂载到 req.user
        req.user = {
            id: payload.id,
            username: payload.username,
            role: payload.role
        } as any;

        const { username, role } = payload;

        if (!username || !role) {
            return res.status(401).json({ code: -1, message: 'Invalid token structure', data: null });
        }

        if (role === 'admin') {
            return adminLimiter(req, res, next);
        } else {
            return userLimiter(req, res, next);
        }

    } catch (error) {
        return res.status(401).json({ code: -1, message: 'Unauthorized - Token verification failed', data: null });
    }
}

export default jwtParser;