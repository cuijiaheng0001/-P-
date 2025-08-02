FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 安装 Python 和系统依赖
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 升级 pip
RUN python3 -m pip install --upgrade pip

# 安装 PyTorch with CUDA support
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 复制 requirements
COPY requirements.txt .

# 安装其他依赖
RUN pip3 install -r requirements.txt

# 安装 xformers 以加速推理
RUN pip3 install xformers

# 复制应用代码
COPY . .

# 创建模型目录
RUN mkdir -p /app/models

# 暴露端口
EXPOSE 8001

# 启动命令
CMD ["python3", "api_server.py"]