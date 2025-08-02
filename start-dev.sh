#!/bin/bash

echo "🚀 启动臭小优P图开发环境..."

# 启动 Redis（如果未运行）
if ! pgrep -x "redis-server" > /dev/null; then
    echo "📦 启动 Redis..."
    redis-server --daemonize yes
fi

# 启动后端 API
echo "🔧 启动后端 API (端口 8000)..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 启动 Celery Worker
echo "👷 启动 Celery Worker..."
celery -A tasks worker --loglevel=info &
CELERY_PID=$!

# 启动前端
echo "🎨 启动前端 (端口 3002)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 所有服务已启动!"
echo ""
echo "📍 访问地址："
echo "   - 前端界面: http://localhost:3002"
echo "   - API 文档: http://localhost:8000/docs"
echo ""
echo "📝 进程 PID："
echo "   - 后端 API: $BACKEND_PID"
echo "   - Celery: $CELERY_PID"
echo "   - 前端: $FRONTEND_PID"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"

# 等待中断信号
trap "echo '正在停止服务...'; kill $BACKEND_PID $CELERY_PID $FRONTEND_PID; exit" INT

# 保持脚本运行
wait