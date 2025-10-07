#!/bin/bash

# 体测管理系统开发环境启动脚本

set -e

echo "🛠️ 启动体测管理系统开发环境..."

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "复制.env.example到.env..."
    cp .env.example .env
    echo "✅ 已创建.env文件，请根据需要修改配置"
fi

# 检查必要目录
echo "创建必要目录..."
mkdir -p logs temp exports

# 安装依赖
echo "安装依赖..."
npm install

# 启动开发服务
echo "启动开发服务（热重载）..."
npm run dev:watch