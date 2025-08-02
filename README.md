# 臭小优P图

基于 Stable Diffusion 的智能 P 图应用，提供瘦脸、瘦身、美颜等功能。

## 功能特性

- 🎭 **智能瘦脸** - 基于 AI 的自然瘦脸效果
- 💃 **智能瘦身** - 使用 ControlNet 实现精准身材调整  
- ✨ **美颜滤镜** - 多种专业级美颜效果
- 🚀 **批量处理** - 支持多张图片同时处理
- 🎨 **实时预览** - 调整参数即时查看效果

## 技术架构

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: FastAPI + Celery + PostgreSQL
- **AI引擎**: Stable Diffusion XL + ControlNet
- **部署**: Docker + Docker Compose

## 快速开始

### 环境要求

- Docker & Docker Compose
- NVIDIA GPU (推荐 8GB+ 显存)
- CUDA 12.1+

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/cuijiaheng0001/-P-.git
cd 臭小优P图
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

3. 启动服务
```bash
docker-compose up -d
```

4. 访问应用
- 前端界面: http://localhost:3000
- API 文档: http://localhost:8000/docs
- Celery 监控: http://localhost:5555

## 项目结构

```
臭小优P图/
├── frontend/          # Next.js 前端
├── backend/           # FastAPI 后端
├── ai-service/        # Stable Diffusion 服务
├── models/            # AI 模型文件
├── docker-compose.yml # Docker 编排配置
└── README.md          # 项目文档
```

## 开发指南

### 本地开发

1. 前端开发
```bash
cd frontend
npm install
npm run dev
```

2. 后端开发
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### API 接口

- `POST /api/upload` - 上传图片
- `POST /api/process/face-slim` - 瘦脸处理
- `POST /api/process/body-slim` - 瘦身处理
- `POST /api/process/beauty-filter` - 美颜滤镜
- `GET /api/task/{task_id}` - 获取任务状态
- `GET /api/result/{task_id}` - 获取处理结果

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License