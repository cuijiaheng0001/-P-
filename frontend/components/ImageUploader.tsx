"use client"

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export function ImageUploader() {
  const { setOriginalImage, setPreviewUrl, setError } = useStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件')
        return
      }

      // 验证文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过 10MB')
        return
      }

      setOriginalImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError(null)
    }
  }, [setOriginalImage, setPreviewUrl, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-purple-500 bg-purple-50 scale-105"
            : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
            {isDragActive ? (
              <ImageIcon className="w-10 h-10 text-purple-600" />
            ) : (
              <Upload className="w-10 h-10 text-purple-600" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isDragActive ? '放开鼠标上传图片' : '拖拽或点击上传图片'}
            </h3>
            <p className="text-gray-500">
              支持 JPG、PNG、WebP 格式，最大 10MB
            </p>
          </div>

          <button className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-colors">
            选择图片
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-lg">🎭</span>
            </div>
            <h4 className="font-semibold">智能瘦脸</h4>
          </div>
          <p className="text-sm text-gray-600">
            AI自动识别脸部，实现自然瘦脸效果
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg">💃</span>
            </div>
            <h4 className="font-semibold">完美身材</h4>
          </div>
          <p className="text-sm text-gray-600">
            智能调整身材比例，打造黄金曲线
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <h4 className="font-semibold">美颜滤镜</h4>
          </div>
          <p className="text-sm text-gray-600">
            多种专业滤镜，让肌肤更加光滑细腻
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg">🚀</span>
            </div>
            <h4 className="font-semibold">一键处理</h4>
          </div>
          <p className="text-sm text-gray-600">
            简单操作，快速获得满意效果
          </p>
        </div>
      </div>
    </div>
  )
}