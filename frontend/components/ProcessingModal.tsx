"use client"

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2 } from 'lucide-react'
import { useStore } from '@/store/useStore'

export function ProcessingModal() {
  const { progress } = useStore()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { name: '上传图片', icon: '📤' },
    { name: '分析图片', icon: '🔍' },
    { name: 'AI 处理中', icon: '🤖' },
    { name: '生成结果', icon: '✨' }
  ]

  useEffect(() => {
    // 根据进度更新当前步骤
    if (progress <= 25) setCurrentStep(0)
    else if (progress <= 50) setCurrentStep(1)
    else if (progress <= 75) setCurrentStep(2)
    else setCurrentStep(3)
  }, [progress])

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-2xl min-w-[400px]">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">正在处理中</h3>
            <p className="text-gray-600 mb-6">请稍候，AI 正在为您优化图片...</p>

            <div className="space-y-4 mb-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    index === currentStep
                      ? 'bg-purple-100 scale-105'
                      : index < currentStep
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      index === currentStep
                        ? 'text-purple-700'
                        : index < currentStep
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < currentStep && (
                    <div className="text-green-500">✓</div>
                  )}
                  {index === currentStep && (
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% 完成</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}