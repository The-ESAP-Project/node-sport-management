#!/bin/bash

# 体测管理系统启动脚本

set -e

echo "🚀 启动体测管理系统后端服务..."

# 检查Node.js版本
echo "检查Node.js版本..."
node_version=$(node -v)
echo "Node.js版本: $node_version"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  警告: 未找到.env文件，请复制.env.example并配置环境变量"
    if [ -f .env.example ]; then
        echo "复制.env.example到.env..."
        cp .env.example .env
        echo "请编辑.env文件并配置数据库和Redis连接信息"
    fi
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 检查必要目录
echo "检查目录结构..."
mkdir -p logs temp exports

# 启动服务
echo "启动服务..."
npm start