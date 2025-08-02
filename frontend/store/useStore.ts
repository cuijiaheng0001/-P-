import { create } from 'zustand'

export interface ProcessingParams {
  faceSlim: {
    enabled: boolean
    intensity: number
  }
  bodySlim: {
    enabled: boolean
    intensity: number
  }
  beautyFilter: {
    enabled: boolean
    type: 'natural' | 'glamour' | 'fresh' | 'artistic'
    intensity: number
  }
}

interface AppState {
  // 图片相关
  originalImage: File | null
  previewUrl: string | null
  processedUrl: string | null
  
  // 处理参数
  params: ProcessingParams
  
  // 状态
  isProcessing: boolean
  progress: number
  error: string | null
  
  // Actions
  setOriginalImage: (file: File | null) => void
  setPreviewUrl: (url: string | null) => void
  setProcessedUrl: (url: string | null) => void
  updateParams: (params: Partial<ProcessingParams>) => void
  setProcessing: (isProcessing: boolean) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialParams: ProcessingParams = {
  faceSlim: {
    enabled: false,
    intensity: 0.5
  },
  bodySlim: {
    enabled: false,
    intensity: 0.5
  },
  beautyFilter: {
    enabled: false,
    type: 'natural',
    intensity: 0.5
  }
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  originalImage: null,
  previewUrl: null,
  processedUrl: null,
  params: initialParams,
  isProcessing: false,
  progress: 0,
  error: null,
  
  // Actions
  setOriginalImage: (file) => set({ originalImage: file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setProcessedUrl: (url) => set({ processedUrl: url }),
  
  updateParams: (newParams) => set((state) => ({
    params: {
      ...state.params,
      ...newParams
    }
  })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    originalImage: null,
    previewUrl: null,
    processedUrl: null,
    params: initialParams,
    isProcessing: false,
    progress: 0,
    error: null
  })
}))