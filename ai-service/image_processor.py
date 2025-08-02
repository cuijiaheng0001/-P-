"""
图像预处理模块
"""
import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
from controlnet_aux import OpenposeDetector, CannyDetector
from typing import Tuple, Optional, List
import dlib

class ImageProcessor:
    def __init__(self):
        # 初始化 MediaPipe
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_pose = mp.solutions.pose
        self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
        
        # 初始化 dlib 人脸检测器
        self.face_detector = dlib.get_frontal_face_detector()
        
        # ControlNet 预处理器
        self.openpose_detector = OpenposeDetector.from_pretrained("lllyasviel/Annotators")
        self.canny_detector = CannyDetector()
        
    def detect_face_region(self, image: Image.Image) -> Optional[Image.Image]:
        """
        检测并返回人脸区域的 mask
        """
        # 转换为 OpenCV 格式
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # 使用 MediaPipe 检测人脸
        with self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        ) as face_mesh:
            results = face_mesh.process(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
            
            if not results.multi_face_landmarks:
                return None
                
            # 创建人脸 mask
            h, w = cv_image.shape[:2]
            mask = np.zeros((h, w), dtype=np.uint8)
            
            # 获取人脸关键点
            face_landmarks = results.multi_face_landmarks[0]
            points = []
            for landmark in face_landmarks.landmark:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                points.append([x, y])
            
            # 创建人脸轮廓
            points = np.array(points, dtype=np.int32)
            hull = cv2.convexHull(points)
            cv2.fillPoly(mask, [hull], 255)
            
            # 膨胀 mask 以包含更多区域
            kernel = np.ones((20, 20), np.uint8)
            mask = cv2.dilate(mask, kernel, iterations=1)
            
            # 高斯模糊使边缘更自然
            mask = cv2.GaussianBlur(mask, (21, 21), 0)
            
            return Image.fromarray(mask)
    
    def detect_body_pose(self, image: Image.Image) -> Image.Image:
        """
        检测身体姿态，返回 OpenPose 骨架图
        """
        # 使用 ControlNet 的 OpenPose 检测器
        pose_image = self.openpose_detector(image)
        return pose_image
    
    def create_body_mask(self, image: Image.Image) -> Optional[Image.Image]:
        """
        创建身体区域的 mask（用于瘦身）
        """
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # 使用 MediaPipe 进行人体分割
        with self.mp_selfie_segmentation.SelfieSegmentation(
            model_selection=1
        ) as selfie_segmentation:
            results = selfie_segmentation.process(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
            
            # 获取分割 mask
            condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.1
            mask = np.where(condition, 255, 0).astype(np.uint8)
            
            # 只取单通道
            mask = mask[:, :, 0]
            
            # 移除头部区域（保留身体）
            face_mask = self.detect_face_region(image)
            if face_mask is not None:
                face_mask_np = np.array(face_mask)
                # 扩大头部区域
                kernel = np.ones((50, 50), np.uint8)
                face_mask_np = cv2.dilate(face_mask_np, kernel, iterations=1)
                # 从身体 mask 中减去头部
                mask = cv2.subtract(mask, face_mask_np)
            
            return Image.fromarray(mask)
    
    def enhance_image_quality(self, image: Image.Image) -> Image.Image:
        """
        增强图像质量（预处理）
        """
        # 转换为 numpy 数组
        img_array = np.array(image)
        
        # 自动色彩平衡
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        # 合并通道
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        # 锐化
        kernel = np.array([[-1,-1,-1],
                          [-1, 9,-1],
                          [-1,-1,-1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # 混合原图和锐化图
        result = cv2.addWeighted(enhanced, 0.7, sharpened, 0.3, 0)
        
        return Image.fromarray(result)
    
    def resize_for_processing(
        self, 
        image: Image.Image, 
        max_size: int = 1024
    ) -> Tuple[Image.Image, float]:
        """
        调整图像大小以适合处理，返回调整后的图像和缩放比例
        """
        w, h = image.size
        
        # 计算缩放比例
        if max(w, h) > max_size:
            if w > h:
                new_w = max_size
                new_h = int(h * (max_size / w))
            else:
                new_h = max_size
                new_w = int(w * (max_size / h))
            
            scale = max_size / max(w, h)
            resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
            return resized, scale
        
        return image, 1.0
    
    def restore_original_size(
        self, 
        processed_image: Image.Image,
        original_size: Tuple[int, int],
        scale: float
    ) -> Image.Image:
        """
        恢复到原始尺寸
        """
        if scale != 1.0:
            return processed_image.resize(original_size, Image.Resampling.LANCZOS)
        return processed_image