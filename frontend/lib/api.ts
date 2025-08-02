import axios from 'axios'
import { useStore } from '@/store/useStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const api = {
  // 上传图片
  uploadImage: async (formData: FormData) => {
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  },

  // 瘦脸处理
  processFaceSlim: async (filename: string, intensity: number) => {
    const response = await apiClient.post('/api/process/face-slim', {
      filename,
      intensity
    })
    return response
  },

  // 瘦身处理
  processBodySlim: async (filename: string, intensity: number) => {
    const response = await apiClient.post('/api/process/body-slim', {
      filename,
      intensity
    })
    return response
  },

  // 美颜滤镜
  processBeautyFilter: async (
    filename: string,
    filterType: string,
    intensity: number
  ) => {
    const response = await apiClient.post('/api/process/beauty-filter', {
      filename,
      filter_type: filterType,
      intensity
    })
    return response
  },

  // 获取任务状态
  getTaskStatus: async (taskId: string) => {
    const response = await apiClient.get(`/api/task/${taskId}`)
    return response
  },

  // 获取处理结果
  getResult: async (taskId: string) => {
    const response = await apiClient.get(`/api/result/${taskId}`, {
      responseType: 'blob'
    })
    return response
  },

  // 等待任务完成并返回结果URL
  waitForResult: async (taskId: string): Promise<string> => {
    const { setProgress } = useStore.getState()
    let attempts = 0
    const maxAttempts = 60 // 最多等待60秒

    while (attempts < maxAttempts) {
      try {
        const { data } = await api.getTaskStatus(taskId)
        
        if (data.progress) {
          setProgress(data.progress)
        }

        if (data.status === 'completed') {
          // 获取结果图片
          const resultResponse = await api.getResult(taskId)
          const blob = resultResponse.data
          const url = URL.createObjectURL(blob)
          return url
        } else if (data.status === 'failed') {
          throw new Error('处理失败')
        }

        // 等待1秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      } catch (error) {
        console.error('获取任务状态失败:', error)
        throw error
      }
    }

    throw new Error('处理超时')
  }
}