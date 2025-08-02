# 臭小优P图 - 项目结构

## 目录说明

```
臭小优P图/
├── frontend/          # Next.js 前端应用
│   ├── components/    # React 组件
│   ├── pages/         # 页面路由
│   ├── styles/        # 样式文件
│   └── public/        # 静态资源
│
├── backend/           # FastAPI 后端服务
│   ├── api/           # API 路由
│   ├── services/      # 业务逻辑
│   ├── models/        # 数据模型
│   └── utils/         # 工具函数
│
├── ai-service/        # Stable Diffusion 服务
│   ├── sd_api.py      # SD API 封装
│   ├── controlnet/    # ControlNet 相关
│   ├── processors/    # 图像预处理
│   └── pipelines/     # AI 处理管道
│
├── models/            # AI 模型文件
│   ├── stable-diffusion/
│   ├── controlnet/
│   └── lora/          # LoRA 模型（美颜、瘦身等）
│
├── uploads/           # 用户上传的原图
├── results/           # 处理后的结果图
├── scripts/           # 部署和维护脚本
├── config/            # 配置文件
└── docker/            # Docker 相关配置
```

## 技术栈详情

### 前端 (Next.js)
- **框架**: Next.js 14+ (App Router)
- **UI库**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **图片处理**: Canvas API + Cropper.js
- **上传组件**: react-dropzone

### 后端 (FastAPI)
- **框架**: FastAPI
- **异步处理**: Celery + Redis
- **图片存储**: MinIO / AWS S3
- **数据库**: PostgreSQL (用户数据、历史记录)
- **缓存**: Redis

### AI 服务 (Stable Diffusion)
- **基础模型**: Stable Diffusion XL
- **控制模型**: 
  - ControlNet (人体姿态控制)
  - OpenPose (骨骼检测)
  - Face Parsing (面部分割)
- **优化技术**:
  - LoRA (轻量化微调)
  - VAE (提升图像质量)
  - xFormers (加速推理)

## 核心功能模块

### 1. 瘦脸模块
- Face Detection (人脸检测)
- Face Landmark (68点定位)
- ControlNet + 定制 LoRA 模型

### 2. 瘦身模块
- OpenPose (身体关键点检测)
- Body Segmentation (身体分割)
- Inpainting + ControlNet 局部重绘

### 3. 美颜滤镜
- 美白: Color Grading LoRA
- 磨皮: Denoising + Face Restoration
- 滤镜: Style Transfer LoRA

### 4. 批量处理
- 任务队列 (Celery)
- 并行处理
- 进度追踪