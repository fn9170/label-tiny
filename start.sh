#!/bin/bash

echo "=========================================="
echo "YOLO 图像标注工具"
echo "=========================================="
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

echo "启动开发服务器..."
echo "访问地址: http://localhost:8080"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="

npm run dev