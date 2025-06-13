# 体质测试数据管理系统 API 文档

## API 概述

- 基础路径：`/api/v1`
- 数据格式：所有请求和响应均使用 JSON 格式
- 认证方式：JWT Bearer Token
- 请求头要求：

```
Content-Type: application/json
Authorization: Bearer <your_token>
```

## 通用响应格式

### 成功响应
```json
{
    "success": true,
    "code": 200,
    "message": "操作成功",
    "data": {
        // 具体的返回数据
    },
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 100
    }
}
```

### 错误响应
```json
{
    "success": false,
    "code": 400,
    "message": "错误描述",
    "errors": [
        {
            "field": "字段名",
            "message": "具体错误信息"
        }
    ]
}
```

## 错误代码说明

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权或授权失败
- 403: 权限不足
- 404: 资源不存在
- 409: 资源冲突
- 422: 实体无法处理
- 429: 请求过于频繁
- 500: 服务器内部错误

## API 端点

### 认证模块 (/auth)

#### 登录

- 路径: `POST /auth/login`
- 描述: 用户登录并获取访问令牌
- 请求体:

```json
{
  "username": "string",
  "password": "string"
}
```

- 响应:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "token": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

#### 刷新令牌

- 路径: `POST /auth/refresh`
- 描述: 使用刷新令牌获取新的访问令牌
- 请求体:

```json
{
  "refreshToken": "string"
}
```

- 响应:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "token": "string",
    "expiresIn": 3600
  }
}
```

#### 令牌注销

- 路径: `POST /auth/revoke`
- 描述: 将当前令牌加入黑名单（可选择注销所有设备）
- 请求头: `Authorization: Bearer <access_token>`
- 请求体:

```json
{
  "refreshToken": "string",
  "revokeAll": false
}
```

- 响应:

```json
{
  "success": true,
  "code": 200,
  "message": "令牌已注销"
}
```

### 用户管理 (/user)

#### 获取用户列表

- 路径: `GET /user`
- 描述: 获取系统用户列表
- 查询参数:
  - page: 页码 (默认: 1)
  - limit: 每页数量 (默认: 10)
  - search: 搜索关键词
  - role: 用户角色筛选
  - status: 用户状态筛选

- 响应:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "users": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 学生管理 (/student)

#### 获取学生列表

- 路径: `GET /student`
- 描述: 获取学生信息列表
- 查询参数:
  - page: 页码 (默认: 1)
  - limit: 每页数量 (默认: 10)
  - search: 搜索关键词
  - class: 班级ID
  - grade: 年级
  - gender: 性别

- 响应:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "students": [
      {
        "id": "string",
        "name": "string",
        "studentId": "string",
        "gender": "string",
        "class": {
          "id": "string",
          "name": "string"
        },
        "grade": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 体测数据管理 (/sport)

#### 添加体测记录

- 路径: `POST /sport`
- 描述: 添加新的体测记录
- 请求体:

```json
{
  "studentId": "string",
  "testDate": "string",
  "items": [
    {
      "type": "string",
      "value": "number",
      "unit": "string"
    }
  ]
}
```

- 响应:

```json
{
  "success": true,
  "code": 201,
  "data": {
    "id": "string",
    "studentId": "string",
    "testDate": "string",
    "items": [
      {
        "type": "string",
        "value": "number",
        "unit": "string",
        "score": "number",
        "level": "string"
      }
    ]
  }
}
```

### 班级管理 (/class)

#### 获取班级体测报告

- 路径: `GET /class/{id}/report`
- 描述: 获取特定班级的体测报告
- 查询参数:
  - startDate: 开始日期
  - endDate: 结束日期
  - testItems: 测试项目（多选）

- 响应:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "classInfo": {
      "id": "string",
      "name": "string",
      "grade": "string"
    },
    "summary": {
      "totalStudents": "number",
      "testedStudents": "number",
      "averageScore": "number"
    },
    "itemStats": [
      {
        "item": "string",
        "average": "number",
        "max": "number",
        "min": "number",
        "distribution": {
          "excellent": "number",
          "good": "number",
          "pass": "number",
          "fail": "number"
        }
      }
    ]
  }
}
```

### 报告生成 (/report)

#### 导出报告

- 路径: `POST /report/export`
- 描述: 导出指定范围的体测报告
- 请求体:

```json
{
  "type": "student|class|grade|school",
  "id": "string",
  "format": "pdf|excel|word",
  "dateRange": {
    "start": "string",
    "end": "string"
  },
  "items": ["string"],
  "includeCharts": "boolean"
}
```

- 响应: 文件流

## 注意事项

1. 所有需要认证的接口必须在请求头中包含有效的 JWT Token
2. 分页接口默认每页返回10条数据
3. 时间相关的字段均使用 ISO 8601 格式
4. 文件上传接口使用 multipart/form-data 格式
5. API 限流策略: 每个IP每分钟最多100次请求

## 开发环境

- 开发环境API地址：`http://dev-api.example.com/api/v1`
- 测试环境API地址：`http://test-api.example.com/api/v1`
- 生产环境API地址：`https://api.example.com/api/v1`

## 更新日志

### v1.0.0 (2025-06-13)

- 初始版本发布
- 实现基础的CRUD功能
- 添加认证和授权系统
- 实现数据导入导出功能
