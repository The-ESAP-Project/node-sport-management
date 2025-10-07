# API 接口文档

## 基础信息
- Base URL: `/api/v1`
- 认证方式: JWT Bearer Token
- 响应格式: JSON
- 分页格式: `?page=1&limit=20`

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 认证相关 `/auth`

### POST `/auth/login` - 用户登录
```json
// Request
{
  "username": "2023-高三一班",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "2023-高三一班",
      "role": "class",
      "permissions": ["read:own", "write:own"]
    },
    "expiresIn": "24h"
  }
}
```

### POST `/auth/logout` - 用户登出
```json
// Response
{
  "success": true,
  "message": "登出成功"
}
```

### GET `/auth/profile` - 获取用户信息
```json
// Response  
{
  "success": true,
  "data": {
    "id": 1,
    "username": "2023-高三一班",
    "role": "class",
    "className": "高三一班",
    "grade": "2023"
  }
}
```

## 学生管理 `/students`

### GET `/students` - 获取学生列表
**权限**: 班级账号只能查看本班，管理员可查看所有

```json
// Query: ?page=1&limit=20&className=高三一班&keyword=张三

// Response
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "name": "张三",
        "gender": "male",
        "className": "高三一班",
        "grade": "2023",
        "hasData": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET `/students/template` - 下载Excel模板
```json
// Response: Excel文件下载
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="student_template.xlsx"
```

### POST `/students/upload` - 上传Excel预览
**Content-Type**: `multipart/form-data`

```json
// FormData: file (Excel文件)

// Response
{
  "success": true,
  "data": {
    "previewId": "preview_uuid_123",
    "summary": {
      "totalRows": 50,
      "validRows": 48,
      "errorRows": 2,
      "className": "高三一班"
    },
    "preview": [
      {
        "row": 1,
        "name": "张三",
        "gender": "male",
        "className": "高三一班",
        "height": 175,
        "weight": 65,
        "vitalCapacity": 4000,
        "run50m": 7.2,
        "longJump": 2.35,
        "sitAndReach": 18,
        "longRun": 210,
        "strengthTest": 15,
        "errors": []
      }
    ],
    "errors": [
      {
        "row": 49,
        "errors": ["身高数据异常", "体重不能为空"]
      }
    ]
  }
}
```

### POST `/students/confirm` - 确认录入数据
```json
// Request
{
  "previewId": "preview_uuid_123"
}

// Response
{
  "success": true,
  "data": {
    "imported": 48,
    "updated": 2,
    "errors": 0
  },
  "message": "数据录入成功"
}
```

### DELETE `/students/preview/{previewId}` - 取消预览
```json
// Response
{
  "success": true,
  "message": "预览数据已清除"
}
```

## 评分标准 `/standards`

### GET `/standards` - 获取评分标准列表
```json
// Query: ?year=2024&active=true

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "2024年国家标准",
      "year": 2024,
      "version": "1.0",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/standards/{id}` - 获取评分标准详情
```json
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "2024年国家标准",
    "year": 2024,
    "version": "1.0",
    "isActive": true,
    "items": [
      {
        "item": "height",
        "itemName": "身高",
        "gender": "male",
        "unit": "cm",
        "weight": 0.05,
        "direction": "higher_better",
        "ranges": [
          { "min": 180, "max": null, "score": 100 },
          { "min": 175, "max": 179, "score": 95 },
          { "min": 170, "max": 174, "score": 85 },
          { "min": 165, "max": 169, "score": 75 },
          { "min": 0, "max": 164, "score": 60 }
        ]
      }
    ]
  }
}
```

### POST `/standards` - 创建评分标准
**权限**: 仅管理员

```json
// Request
{
  "name": "2024年修订标准",
  "year": 2024,
  "baseStandardId": 1,
  "items": [
    {
      "item": "height",
      "gender": "male", 
      "unit": "cm",
      "weight": 0.05,
      "direction": "higher_better",
      "ranges": [
        { "min": 180, "max": null, "score": 100 },
        { "min": 175, "max": 179, "score": 95 }
      ]
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "name": "2024年修订标准"
  },
  "message": "评分标准创建成功"
}
```

### PUT `/standards/{id}/activate` - 激活评分标准
```json
// Response
{
  "success": true,
  "message": "评分标准已激活，相关数据正在重新计算"
}
```

## 成绩管理 `/scores`

### GET `/scores` - 获取成绩列表
```json
// Query: ?className=高三一班&year=2024&page=1&limit=20

// Response
{
  "success": true,
  "data": {
    "scores": [
      {
        "studentId": 1,
        "studentName": "张三",
        "className": "高三一班",
        "year": 2024,
        "totalScore": 87.5,
        "classRank": 5,
        "gradeRank": 23,
        "items": [
          {
            "item": "height",
            "itemName": "身高",
            "rawValue": 175,
            "score": 95,
            "unit": "cm"
          }
        ],
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET `/scores/{studentId}` - 获取学生成绩详情
```json
// Response
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "name": "张三",
      "gender": "male",
      "className": "高三一班"
    },
    "currentYear": {
      "year": 2024,
      "totalScore": 87.5,
      "classRank": 5,
      "gradeRank": 23,
      "items": [
        {
          "item": "height",
          "itemName": "身高", 
          "rawValue": 175,
          "score": 95,
          "unit": "cm",
          "percentile": 75
        }
      ]
    },
    "history": [
      {
        "year": 2023,
        "totalScore": 85.2,
        "classRank": 8,
        "gradeRank": 28
      }
    ]
  }
}
```

## 数据分析 `/analysis`

### GET `/analysis/overview` - 概览统计
```json
// Query: ?scope=class&target=高三一班&year=2024

// Response
{
  "success": true,
  "data": {
    "scope": "class",
    "target": "高三一班",
    "year": 2024,
    "summary": {
      "totalStudents": 50,
      "avgScore": 82.3,
      "maxScore": 96.5,
      "minScore": 65.2,
      "passRate": 0.92
    },
    "distribution": [
      { "range": "90-100", "count": 8 },
      { "range": "80-89", "count": 25 },
      { "range": "70-79", "count": 12 },
      { "range": "60-69", "count": 5 }
    ]
  }
}
```

### GET `/analysis/trends` - 趋势分析
```json
// Query: ?scope=class&target=高三一班&years=2022,2023,2024

// Response
{
  "success": true,
  "data": {
    "trends": {
      "years": [2022, 2023, 2024],
      "avgScores": [79.5, 81.2, 82.3],
      "passRates": [0.88, 0.90, 0.92]
    },
    "itemTrends": [
      {
        "item": "height",
        "itemName": "身高",
        "data": [82.1, 83.5, 84.2]
      }
    ]
  }
}
```

### GET `/analysis/ranking` - 排名分析
```json
// Query: ?scope=grade&grade=2024&limit=10

// Response
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "studentName": "李四",
        "className": "高三二班",
        "totalScore": 96.5
      }
    ],
    "classRankings": [
      {
        "rank": 1,
        "className": "高三二班",
        "avgScore": 85.2,
        "studentCount": 48
      }
    ]
  }
}
```

## 数据导出 `/export`

### GET `/export/template` - 下载导入模板
```json
// Response: Excel文件下载
```

### POST `/export/scores` - 导出成绩数据
```json
// Request
{
  "scope": "class",
  "target": "高三一班",
  "year": 2024,
  "format": "excel",
  "includeDetails": true
}

// Response
{
  "success": true,
  "data": {
    "downloadUrl": "/api/v1/files/export_scores_20240115.xlsx",
    "expiresAt": "2024-01-15T18:00:00Z"
  }
}
```

## 系统管理 `/system`

### GET `/system/config` - 获取系统配置
```json
// Response
{
  "success": true,
  "data": {
    "uploadDeadline": "2024-09-30T23:59:59Z",
    "currentYear": 2024,
    "activeStandardId": 1,
    "systemStatus": "normal"
  }
}
```

### PUT `/system/config` - 更新系统配置
**权限**: 仅管理员

```json
// Request
{
  "uploadDeadline": "2024-10-15T23:59:59Z",
  "currentYear": 2024
}

// Response
{
  "success": true,
  "message": "系统配置更新成功"
}
```

## 错误码定义

| 错误码 | 描述 |
|--------|------|
| AUTH_001 | 认证失败 |
| AUTH_002 | 权限不足 |
| AUTH_003 | Token过期 |
| VALID_001 | 参数校验失败 |
| VALID_002 | 文件格式错误 |
| VALID_003 | 数据校验失败 |
| BIZ_001 | 录入截止时间已过 |
| BIZ_002 | 预览数据不存在 |
| BIZ_003 | 评分标准不存在 |
| SYS_001 | 系统内部错误 |
| SYS_002 | 数据库连接错误 |