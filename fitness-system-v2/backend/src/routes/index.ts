import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import classRoutes from './classes';
import studentRoutes from './students';
import sportDataRoutes from './sportData';
import excelRoutes from './excel';
import evaluationStandardRoutes from './evaluationStandards';
import analyticsRoutes from './analytics';
import cacheRoutes from './cache';
import systemConfigRoutes from './systemConfig';

const router: Router = Router();

// API版本前缀
const API_VERSION = '/api/v1';

// 认证相关路由
router.use(`${API_VERSION}/auth`, authRoutes);

// 用户管理路由
router.use(`${API_VERSION}/users`, userRoutes);

// 班级管理路由
router.use(`${API_VERSION}/classes`, classRoutes);

// 学生管理路由
router.use(`${API_VERSION}/students`, studentRoutes);

// 体测数据路由
router.use(`${API_VERSION}/sport-data`, sportDataRoutes);

// Excel导入导出路由
router.use(`${API_VERSION}/excel`, excelRoutes);

// 评分标准路由
router.use(`${API_VERSION}/evaluation-standards`, evaluationStandardRoutes);

// 数据分析路由
router.use(`${API_VERSION}/analytics`, analyticsRoutes);

// 缓存管理路由
router.use(`${API_VERSION}/cache`, cacheRoutes);

// 系统配置���由
router.use(`${API_VERSION}/system-config`, systemConfigRoutes);

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API文档路由
router.get(`${API_VERSION}/docs`, (req, res) => {
  res.json({
    message: 'Fitness Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/v1/auth/login': '用户登录',
        'POST /api/v1/auth/logout': '用户登出',
        'GET /api/v1/auth/me': '获取当前用户信息',
        'POST /api/v1/auth/refresh-token': '刷新令牌',
        'POST /api/v1/auth/change-password': '修改密码',
        'POST /api/v1/auth/validate-token': '验证令牌'
      },
      users: {
        'POST /api/v1/users': '创建用户（管理员）',
        'GET /api/v1/users': '获取用户列表（管理员）',
        'GET /api/v1/users/class': '获取班级账号列表（管理员）',
        'GET /api/v1/users/:id': '获取用户详情（管理员）',
        'PUT /api/v1/users/:id/status': '更新用户状态（管理员）',
        'PUT /api/v1/users/:id/reset-password': '重置密码（管理员）',
        'POST /api/v1/users/batch/class': '批量创建班级账号（管理员）'
      },
      classes: {
        'POST /api/v1/classes': '创建班级（管理员）',
        'GET /api/v1/classes': '获取班级列表',
        'GET /api/v1/classes/grades': '获取年级列表',
        'GET /api/v1/classes/academic-years': '获取学年列表',
        'GET /api/v1/classes/grade/:grade': '根据年级获取班级列表',
        'GET /api/v1/classes/:id': '获取班级详情',
        'GET /api/v1/classes/:id/stats': '获取班级统计信息',
        'PUT /api/v1/classes/:id': '更新班级信息（管理员）',
        'DELETE /api/v1/classes/:id': '删除班级（管理员）',
        'POST /api/v1/classes/batch': '批量创建班级（管理员）'
      },
      students: {
        'POST /api/v1/students': '创建学生',
        'GET /api/v1/students/class/:classID': '根据班级获取学生列表',
        'GET /api/v1/students/register/:registerNumber': '根据学籍号获取学生信息',
        'GET /api/v1/students/:id': '获取学生详细信息（包含体测数据）',
        'PUT /api/v1/students/:id': '更新学生信息',
        'DELETE /api/v1/students/:id': '删除学生',
        'POST /api/v1/students/batch/import': '批量导入学生',
        'POST /api/v1/students/validate': '验证学生数据',
        'GET /api/v1/students/stats/grade/:grade': '按年级获取学生统计（管理员）'
      },
      sportData: {
        'PUT /api/v1/sport-data/student/:studentID/year/:year': '创建或更新学生体测数据',
        'GET /api/v1/sport-data/student/:studentID/year/:year': '获取学生某年的体测数据',
        'GET /api/v1/sport-data/class/:classID/year/:year/stats': '获取班级体测数据统计',
        'GET /api/v1/sport-data/grade/:gradeID/trend': '获取年级体测数据趋势（管理员）',
        'POST /api/v1/sport-data/rankings/year/:year': '计算指定年份的排名（管理员）',
        'POST /api/v1/sport-data/batch/update': '批量更新体测数据',
        'GET /api/v1/sport-data/items': '获取体测项目列表',
        'POST /api/v1/sport-data/validate': '验证体测数据',
        'GET /api/v1/sport-data/export/class/:classID/year/:year': '导出班级体测数据'
      },
      excel: {
        'POST /api/v1/excel/upload/preview': '上传并预览Excel文件',
        'POST /api/v1/excel/import/confirm': '确认导入Excel数据',
        'GET /api/v1/excel/export/class/:classID/year/:year': '导出班级学生数据',
        'GET /api/v1/excel/template/download': '下载导入模板',
        'GET /api/v1/excel/preview/:previewId/status': '获取预览数据状态',
        'DELETE /api/v1/excel/preview/:previewId/cancel': '取消预览（清理数据）',
        'GET /api/v1/excel/process/:processId/progress': '获取Excel处理进度'
      },
      evaluationStandards: {
        'POST /api/v1/evaluation-standards': '创建评分标准（管理员）',
        'GET /api/v1/evaluation-standards': '获取评分标准列表',
        'GET /api/v1/evaluation-standards/sport-items': '获取支持的体测项目列表',
        'GET /api/v1/evaluation-standards/applicable': '获取适用的评分标准',
        'POST /api/v1/evaluation-standards/calculate': '计算体测成绩等级和分数',
        'GET /api/v1/evaluation-standards/:id': '根据ID获取评分标准',
        'PUT /api/v1/evaluation-standards/:id': '更新评分标准（管理员）',
        'DELETE /api/v1/evaluation-standards/:id': '删除评分标准（管理员）',
        'PUT /api/v1/evaluation-standards/:id/status': '启用/禁用评分标准（管理员）',
        'POST /api/v1/evaluation-standards/batch': '批量创建评分标准（管理员）'
      },
      analytics: {
        'GET /api/v1/analytics/dashboard/:year': '获取仪表板数据（管理员）',
        'GET /api/v1/analytics/overview/:year': '获取整体统计信息（管理员）',
        'GET /api/v1/analytics/class/:classID/year/:year': '获取班级统计信息',
        'GET /api/v1/analytics/class/:classID/year/:year/detail': '获取班级详细分析',
        'GET /api/v1/analytics/grade/:grade/year/:year': '获取年级统计信息（管理员）',
        'GET /api/v1/analytics/grade/:grade/year/:year/detail': '获取年级详细分析（管理员）',
        'GET /api/v1/analytics/grade/:grade/year/:year/sport-items': '获取年级体测项目统计（管理员）',
        'GET /api/v1/analytics/trends': '获取趋势数据（管理员）',
        'POST /api/v1/analytics/class-comparison/:year': '获取多班级对比统计（管理员）',
        'GET /api/v1/analytics/grade-rankings/:year': '获取年级排名统计（管理员）'
      },
      cache: {
        'GET /api/v1/cache/health': '缓存健康检查（管理员）',
        'GET /api/v1/cache/stats': '获取缓存统计信息（管理员）',
        'POST /api/v1/cache/clear': '清理缓存（管理员）',
        'POST /api/v1/cache/batch-clear': '批量清理缓存（管理员）',
        'GET /api/v1/cache/keys': '获取缓存键列表（管理员）',
        'GET /api/v1/cache/preview/:previewId': '获取预览数据',
        'DELETE /api/v1/cache/preview/:previewId': '删除预览数据',
        'POST /api/v1/cache/custom': '设置自定义缓存（管理员）',
        'GET /api/v1/cache/custom/:key': '获取自定义缓存（管理员）',
        'DELETE /api/v1/cache/custom/:key': '删除自定义缓存（管理员）',
        'POST /api/v1/cache/counter/:key/increment': '增量计数器（管理员）'
      },
      systemConfig: {
        'GET /api/v1/system-config/public': '获取公开配置',
        'GET /api/v1/system-config/overview': '获取系统概览（管理员）',
        'GET /api/v1/system-config/categories': '获取配置分类列表（管理员）',
        'POST /api/v1/system-config': '创建系统配置（管理员）',
        'GET /api/v1/system-config': '获取系统配置列表（管理员）',
        'POST /api/v1/system-config/multiple': '批量获取配置（管理员）',
        'POST /api/v1/system-config/init-defaults': '初始化默认配置（管理员）',
        'DELETE /api/v1/system-config/cache': '清除配置缓存（管理员）',
        'GET /api/v1/system-config/category/:category': '按分类获取配置（管理员）',
        'GET /api/v1/system-config/:key': '根据键获取配置（管理员）',
        'PUT /api/v1/system-config/:key': '更新系统配置（管理员）',
        'DELETE /api/v1/system-config/:key': '删除系统配置（管理员）',
        'GET /api/v1/system-config/:key/value': '获取配置值（管理员）',
        'PUT /api/v1/system-config/:key/value': '设置配置值（管理员）',
        'POST /api/v1/system-config/:key/reset': '重置配置到默认值（管理员）'
      }
    }
  });
});

export default router;