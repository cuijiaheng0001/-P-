from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from typing import Optional, Dict, Any
import os
from datetime import datetime
import uuid
from tasks import celery_app, process_image, task_progress
import shutil
from pathlib import Path

app = FastAPI(title="臭小优P图 API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 确保必要的目录存在
Path("uploads").mkdir(exist_ok=True)
Path("results").mkdir(exist_ok=True)

# 静态文件服务（用于测试）
app.mount("/static/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static/results", StaticFiles(directory="results"), name="results")

# 存储任务信息
active_tasks: Dict[str, Any] = {}

@app.get("/")
async def root():
    return {"message": "臭小优P图 API 服务运行中"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """上传图片"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只支持图片文件")
    
    # 验证文件大小
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="图片大小不能超过 10MB")
    
    # 生成唯一文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = file.filename.split('.')[-1]
    filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_ext}"
    filepath = Path("uploads") / filename
    
    # 保存文件
    with open(filepath, "wb") as f:
        f.write(contents)
    
    return {
        "filename": filename,
        "filepath": str(filepath),
        "url": f"/static/uploads/{filename}",
        "message": "上传成功"
    }

@app.post("/api/process/face-slim")
async def process_face_slim(
    filename: str,
    intensity: float = 0.5
):
    """瘦脸处理"""
    # 创建 Celery 任务
    task = process_image.delay(filename, [{
        "type": "face_slim",
        "intensity": intensity
    }])
    
    active_tasks[task.id] = {
        "type": "face_slim",
        "filename": filename,
        "start_time": datetime.now()
    }
    
    return {
        "status": "processing",
        "message": "瘦脸处理已开始",
        "task_id": task.id
    }

@app.post("/api/process/body-slim")
async def process_body_slim(
    filename: str,
    intensity: float = 0.5
):
    """瘦身处理"""
    task = process_image.delay(filename, [{
        "type": "body_slim",
        "intensity": intensity
    }])
    
    active_tasks[task.id] = {
        "type": "body_slim",
        "filename": filename,
        "start_time": datetime.now()
    }
    
    return {
        "status": "processing",
        "message": "瘦身处理已开始",
        "task_id": task.id
    }

@app.post("/api/process/beauty-filter")
async def process_beauty_filter(
    filename: str,
    filter_type: str = "natural",
    intensity: float = 0.5
):
    """美颜滤镜"""
    task = process_image.delay(filename, [{
        "type": "beauty_filter",
        "filter_type": filter_type,
        "intensity": intensity
    }])
    
    active_tasks[task.id] = {
        "type": "beauty_filter",
        "filename": filename,
        "filter_type": filter_type,
        "start_time": datetime.now()
    }
    
    return {
        "status": "processing",
        "message": "美颜处理已开始",
        "task_id": task.id
    }

@app.post("/api/process/all")
async def process_all(
    filename: str,
    face_slim: Optional[Dict[str, Any]] = None,
    body_slim: Optional[Dict[str, Any]] = None,
    beauty_filter: Optional[Dict[str, Any]] = None
):
    """批量处理：可以同时应用多个效果"""
    operations = []
    
    if face_slim and face_slim.get("enabled"):
        operations.append({
            "type": "face_slim",
            "intensity": face_slim.get("intensity", 0.5)
        })
    
    if body_slim and body_slim.get("enabled"):
        operations.append({
            "type": "body_slim",
            "intensity": body_slim.get("intensity", 0.5)
        })
    
    if beauty_filter and beauty_filter.get("enabled"):
        operations.append({
            "type": "beauty_filter",
            "filter_type": beauty_filter.get("type", "natural"),
            "intensity": beauty_filter.get("intensity", 0.5)
        })
    
    if not operations:
        raise HTTPException(status_code=400, detail="至少需要启用一个处理选项")
    
    task = process_image.delay(filename, operations)
    
    active_tasks[task.id] = {
        "type": "all",
        "filename": filename,
        "operations": operations,
        "start_time": datetime.now()
    }
    
    return {
        "status": "processing",
        "message": "批量处理已开始",
        "task_id": task.id
    }

@app.get("/api/task/{task_id}")
async def get_task_status(task_id: str):
    """获取任务状态"""
    task = celery_app.AsyncResult(task_id)
    
    # 从任务进度存储中获取详细进度
    progress_info = task_progress.get(task_id, {})
    
    if task.state == 'PENDING':
        return {
            "task_id": task_id,
            "status": "pending",
            "progress": 0,
            "message": "任务等待中"
        }
    elif task.state == 'PROGRESS':
        return {
            "task_id": task_id,
            "status": "processing",
            "progress": progress_info.get("progress", 0),
            "message": progress_info.get("status", "处理中")
        }
    elif task.state == 'SUCCESS':
        result = task.result
        return {
            "task_id": task_id,
            "status": "completed",
            "progress": 100,
            "result": result,
            "result_url": result.get("result_url")
        }
    else:  # FAILURE
        return {
            "task_id": task_id,
            "status": "failed",
            "progress": 0,
            "error": str(task.info)
        }

@app.get("/api/result/{task_id}")
async def get_result(task_id: str):
    """获取处理结果"""
    # 检查结果文件是否存在
    result_path = Path("results") / f"result_{task_id}.jpg"
    
    if not result_path.exists():
        # 尝试从任务结果中获取文件名
        task = celery_app.AsyncResult(task_id)
        if task.state == 'SUCCESS' and task.result:
            filename = task.result.get("result_filename")
            if filename:
                result_path = Path("results") / filename
    
    if result_path.exists():
        return FileResponse(
            result_path,
            media_type="image/jpeg",
            filename=f"processed_{task_id}.jpg"
        )
    else:
        raise HTTPException(status_code=404, detail="结果未找到")

@app.delete("/api/task/{task_id}")
async def cancel_task(task_id: str):
    """取消任务"""
    task = celery_app.AsyncResult(task_id)
    task.revoke(terminate=True)
    
    if task_id in active_tasks:
        del active_tasks[task_id]
    
    return {"message": "任务已取消"}

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "臭小优P图 API",
        "version": "1.0.0",
        "active_tasks": len(active_tasks)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)