from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
from typing import Optional
import os
from datetime import datetime

app = FastAPI(title="臭小优P图 API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 确保必要的目录存在
os.makedirs("../uploads", exist_ok=True)
os.makedirs("../results", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "臭小优P图 API 服务运行中"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """上传图片"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只支持图片文件")
    
    # 生成唯一文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    filepath = f"../uploads/{filename}"
    
    # 保存文件
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {
        "filename": filename,
        "filepath": filepath,
        "message": "上传成功"
    }

@app.post("/api/process/face-slim")
async def process_face_slim(
    filename: str,
    intensity: float = 0.5
):
    """瘦脸处理"""
    # TODO: 调用 Stable Diffusion 瘦脸处理
    return {
        "status": "processing",
        "message": "瘦脸处理中",
        "task_id": "face_slim_123"
    }

@app.post("/api/process/body-slim")
async def process_body_slim(
    filename: str,
    intensity: float = 0.5
):
    """瘦身处理"""
    # TODO: 调用 Stable Diffusion 瘦身处理
    return {
        "status": "processing",
        "message": "瘦身处理中",
        "task_id": "body_slim_123"
    }

@app.post("/api/process/beauty-filter")
async def process_beauty_filter(
    filename: str,
    filter_type: str = "natural",
    intensity: float = 0.5
):
    """美颜滤镜"""
    # TODO: 调用 Stable Diffusion 美颜处理
    return {
        "status": "processing",
        "message": "美颜处理中",
        "task_id": "beauty_123"
    }

@app.get("/api/task/{task_id}")
async def get_task_status(task_id: str):
    """获取任务状态"""
    # TODO: 从 Celery 获取真实任务状态
    return {
        "task_id": task_id,
        "status": "completed",
        "progress": 100,
        "result_url": f"/api/result/{task_id}"
    }

@app.get("/api/result/{task_id}")
async def get_result(task_id: str):
    """获取处理结果"""
    # TODO: 返回真实处理结果
    # 临时返回示例
    return FileResponse(
        "../results/example.jpg",
        media_type="image/jpeg",
        filename="result.jpg"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)