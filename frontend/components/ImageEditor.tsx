"use client"

import { useState } from 'react'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ControlPanel } from './ControlPanel'
import { ImagePreview } from './ImagePreview'
import { ProcessingModal } from './ProcessingModal'
import { api } from '@/lib/api'

export function ImageEditor() {
  const {
    originalImage,
    previewUrl,
    processedUrl,
    params,
    isProcessing,
    setProcessing,
    setProcessedUrl,
    setError,
    reset
  } = useStore()

  const [showComparison, setShowComparison] = useState(false)

  const handleProcess = async () => {
    if (!originalImage) return

    setProcessing(true)
    setError(null)

    try {
      // 上传图片
      const formData = new FormData()
      formData.append('file', originalImage)
      
      const uploadRes = await api.uploadImage(formData)
      const { filename } = uploadRes.data

      // 处理图片
      const tasks = []
      
      if (params.faceSlim.enabled) {
        tasks.push(api.processFaceSlim(filename, params.faceSlim.intensity))
      }
      
      if (params.bodySlim.enabled) {
        tasks.push(api.processBodySlim(filename, params.bodySlim.intensity))
      }
      
      if (params.beautyFilter.enabled) {
        tasks.push(api.processBeautyFilter(
          filename,
          params.beautyFilter.type,
          params.beautyFilter.intensity
        ))
      }

      // 等待所有任务完成
      const results = await Promise.all(tasks)
      
      // 获取最终结果
      const lastTaskId = results[results.length - 1].data.task_id
      const resultUrl = await api.waitForResult(lastTaskId)
      
      setProcessedUrl(resultUrl)
      setShowComparison(true)
    } catch (error) {
      setError('处理失败，请重试')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedUrl) return
    
    const a = document.createElement('a')
    a.href = processedUrl
    a.download = `processed_${Date.now()}.jpg`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>重新选择图片</span>
        </button>

        <div className="flex gap-3">
          {processedUrl && (
            <>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showComparison ? '隐藏对比' : '显示对比'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下载图片</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ImagePreview
            originalUrl={previewUrl}
            processedUrl={processedUrl}
            showComparison={showComparison}
          />
        </div>

        <div className="lg:col-span-1">
          <ControlPanel onProcess={handleProcess} />
        </div>
      </div>

      {isProcessing && <ProcessingModal />}
    </div>
  )
}