"""
Stable Diffusion 服务封装
"""
import torch
from diffusers import (
    StableDiffusionXLPipeline,
    StableDiffusionXLInpaintPipeline,
    ControlNetModel,
    StableDiffusionXLControlNetPipeline,
    AutoencoderKL
)
from PIL import Image
import numpy as np
from typing import Optional, Dict, Any
import os

class StableDiffusionService:
    def __init__(self, model_path: str = "./models/stable-diffusion"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_path = model_path
        self.pipelines = {}
        
    def load_base_model(self):
        """加载基础 SDXL 模型"""
        print("正在加载 Stable Diffusion XL 模型...")
        
        # 加载 VAE
        vae = AutoencoderKL.from_pretrained(
            "madebyollin/sdxl-vae-fp16-fix", 
            torch_dtype=torch.float16
        )
        
        # 加载主模型
        self.pipelines['base'] = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            vae=vae,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        ).to(self.device)
        
        # 启用内存优化
        self.pipelines['base'].enable_model_cpu_offload()
        self.pipelines['base'].enable_vae_slicing()
        
    def load_controlnet_models(self):
        """加载 ControlNet 模型"""
        print("正在加载 ControlNet 模型...")
        
        # OpenPose ControlNet (身体姿态控制)
        openpose_controlnet = ControlNetModel.from_pretrained(
            "thibaud/controlnet-openpose-sdxl-1.0",
            torch_dtype=torch.float16
        )
        
        self.pipelines['openpose'] = StableDiffusionXLControlNetPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            controlnet=openpose_controlnet,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        ).to(self.device)
        
    def load_inpaint_model(self):
        """加载 Inpainting 模型（局部修改）"""
        print("正在加载 Inpainting 模型...")
        
        self.pipelines['inpaint'] = StableDiffusionXLInpaintPipeline.from_pretrained(
            "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
            torch_dtype=torch.float16,
            variant="fp16"
        ).to(self.device)
        
    def face_slimming(
        self,
        image: Image.Image,
        mask: Optional[Image.Image] = None,
        intensity: float = 0.5,
        **kwargs
    ) -> Image.Image:
        """
        瘦脸处理
        
        Args:
            image: 输入图片
            mask: 脸部区域mask
            intensity: 瘦脸强度 (0-1)
        """
        # 生成瘦脸提示词
        prompt = self._generate_face_slim_prompt(intensity)
        negative_prompt = "deformed, ugly, bad anatomy, bad face"
        
        # 使用 inpainting 进行局部修改
        if 'inpaint' not in self.pipelines:
            self.load_inpaint_model()
            
        result = self.pipelines['inpaint'](
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=image,
            mask_image=mask,
            height=image.height,
            width=image.width,
            strength=0.3 + intensity * 0.4,  # 调整强度
            guidance_scale=7.5,
            num_inference_steps=30,
            **kwargs
        ).images[0]
        
        return result
    
    def body_slimming(
        self,
        image: Image.Image,
        pose_image: Optional[Image.Image] = None,
        intensity: float = 0.5,
        **kwargs
    ) -> Image.Image:
        """
        瘦身处理
        
        Args:
            image: 输入图片
            pose_image: OpenPose 骨架图
            intensity: 瘦身强度 (0-1)
        """
        # 生成瘦身提示词
        prompt = self._generate_body_slim_prompt(intensity)
        negative_prompt = "deformed body, bad anatomy, extra limbs"
        
        # 使用 ControlNet 进行姿态控制的图像生成
        if 'openpose' not in self.pipelines:
            self.load_controlnet_models()
            
        result = self.pipelines['openpose'](
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=pose_image,
            height=image.height,
            width=image.width,
            guidance_scale=7.5,
            num_inference_steps=30,
            controlnet_conditioning_scale=0.5 + intensity * 0.3,
            **kwargs
        ).images[0]
        
        return result
    
    def apply_beauty_filter(
        self,
        image: Image.Image,
        filter_type: str = "natural",
        intensity: float = 0.5,
        **kwargs
    ) -> Image.Image:
        """
        应用美颜滤镜
        
        Args:
            image: 输入图片
            filter_type: 滤镜类型
            intensity: 滤镜强度
        """
        # 根据滤镜类型生成提示词
        prompt = self._generate_beauty_prompt(filter_type, intensity)
        negative_prompt = "over-processed, artificial looking, plastic skin"
        
        if 'base' not in self.pipelines:
            self.load_base_model()
            
        # 使用 img2img 模式
        result = self.pipelines['base'].img2img(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=image,
            strength=0.2 + intensity * 0.3,
            guidance_scale=7.5,
            num_inference_steps=20,
            **kwargs
        ).images[0]
        
        return result
    
    def _generate_face_slim_prompt(self, intensity: float) -> str:
        """生成瘦脸提示词"""
        base_prompt = "beautiful face, slim face, v-shaped face, defined jawline"
        if intensity > 0.7:
            return f"{base_prompt}, very slim face, sharp chin"
        elif intensity > 0.4:
            return f"{base_prompt}, moderately slim face"
        else:
            return f"{base_prompt}, naturally slim face"
    
    def _generate_body_slim_prompt(self, intensity: float) -> str:
        """生成瘦身提示词"""
        base_prompt = "fit body, slim figure, proportional body"
        if intensity > 0.7:
            return f"{base_prompt}, very slim body, model figure"
        elif intensity > 0.4:
            return f"{base_prompt}, athletic body, toned figure"
        else:
            return f"{base_prompt}, naturally slim body"
    
    def _generate_beauty_prompt(self, filter_type: str, intensity: float) -> str:
        """生成美颜提示词"""
        filters = {
            "natural": "natural beauty, healthy skin, soft lighting",
            "glamour": "glamorous, professional photography, studio lighting",
            "fresh": "fresh looking, youthful, bright skin",
            "artistic": "artistic portrait, creative lighting, aesthetic"
        }
        
        base_prompt = filters.get(filter_type, filters["natural"])
        
        if intensity > 0.7:
            return f"{base_prompt}, flawless skin, perfect complexion"
        elif intensity > 0.4:
            return f"{base_prompt}, smooth skin, even skin tone"
        else:
            return f"{base_prompt}, subtle enhancement"