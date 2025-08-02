"use client"

import { Wand2 } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import * as Tabs from '@radix-ui/react-tabs'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

interface ControlPanelProps {
  onProcess: () => void
}

export function ControlPanel({ onProcess }: ControlPanelProps) {
  const { params, updateParams, isProcessing } = useStore()

  const handleFaceSlimChange = (value: number[]) => {
    updateParams({
      faceSlim: { ...params.faceSlim, intensity: value[0] }
    })
  }

  const handleBodySlimChange = (value: number[]) => {
    updateParams({
      bodySlim: { ...params.bodySlim, intensity: value[0] }
    })
  }

  const handleBeautyIntensityChange = (value: number[]) => {
    updateParams({
      beautyFilter: { ...params.beautyFilter, intensity: value[0] }
    })
  }

  const handleBeautyTypeChange = (type: 'natural' | 'glamour' | 'fresh' | 'artistic') => {
    updateParams({
      beautyFilter: { ...params.beautyFilter, type }
    })
  }

  const isAnyFeatureEnabled = params.faceSlim.enabled || params.bodySlim.enabled || params.beautyFilter.enabled

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">调整参数</h2>

      <Tabs.Root defaultValue="face" className="w-full">
        <Tabs.List className="flex w-full mb-6 bg-gray-100 rounded-lg p-1">
          <Tabs.Trigger
            value="face"
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            瘦脸
          </Tabs.Trigger>
          <Tabs.Trigger
            value="body"
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            瘦身
          </Tabs.Trigger>
          <Tabs.Trigger
            value="beauty"
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            美颜
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="face" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium">智能瘦脸</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.faceSlim.enabled}
                onChange={(e) => updateParams({
                  faceSlim: { ...params.faceSlim, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {params.faceSlim.enabled && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>自然</span>
                <span>强烈</span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[params.faceSlim.intensity]}
                onValueChange={handleFaceSlimChange}
                max={1}
                step={0.01}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-gradient-to-r from-pink-400 to-purple-600 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none focus:shadow-xl" />
              </Slider.Root>
              <div className="text-center text-sm text-gray-500">
                强度：{Math.round(params.faceSlim.intensity * 100)}%
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              AI 会自动检测面部轮廓，实现自然的瘦脸效果
            </p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="body" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium">智能瘦身</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.bodySlim.enabled}
                onChange={(e) => updateParams({
                  bodySlim: { ...params.bodySlim, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {params.bodySlim.enabled && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>微调</span>
                <span>明显</span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[params.bodySlim.intensity]}
                onValueChange={handleBodySlimChange}
                max={1}
                step={0.01}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-gradient-to-r from-pink-400 to-purple-600 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none focus:shadow-xl" />
              </Slider.Root>
              <div className="text-center text-sm text-gray-500">
                强度：{Math.round(params.bodySlim.intensity * 100)}%
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              智能识别身体轮廓，打造完美身材比例
            </p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="beauty" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium">美颜滤镜</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.beautyFilter.enabled}
                onChange={(e) => updateParams({
                  beautyFilter: { ...params.beautyFilter, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {params.beautyFilter.enabled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {(['natural', 'glamour', 'fresh', 'artistic'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleBeautyTypeChange(type)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      params.beautyFilter.type === type
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {type === 'natural' && '自然'}
                    {type === 'glamour' && '魅力'}
                    {type === 'fresh' && '清新'}
                    {type === 'artistic' && '艺术'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>轻微</span>
                  <span>强烈</span>
                </div>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[params.beautyFilter.intensity]}
                  onValueChange={handleBeautyIntensityChange}
                  max={1}
                  step={0.01}
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-gradient-to-r from-pink-400 to-purple-600 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none focus:shadow-xl" />
                </Slider.Root>
                <div className="text-center text-sm text-gray-500">
                  强度：{Math.round(params.beautyFilter.intensity * 100)}%
                </div>
              </div>
            </>
          )}

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              专业美颜算法，让肌肤更加光滑细腻
            </p>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <button
        onClick={onProcess}
        disabled={!isAnyFeatureEnabled || isProcessing}
        className={cn(
          "w-full mt-6 px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2",
          isAnyFeatureEnabled && !isProcessing
            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        <Wand2 className="w-5 h-5" />
        <span>{isProcessing ? '处理中...' : '开始处理'}</span>
      </button>
    </div>
  )
}