#!/bin/bash
set -e

cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "安装依赖..."
  npm install
fi

# 启动开发服务器
echo "启动 XNote 开发服务器..."
npm run dev
