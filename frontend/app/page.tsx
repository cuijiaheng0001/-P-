"use client"

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { ImageEditor } from '@/components/ImageEditor'
import { useStore } from '@/store/useStore'

export default function Home() {
  const { originalImage } = useStore()

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            臭小优P图
          </h1>
          <p className="text-gray-600 text-lg">
            AI智能美颜，让你的照片更加完美
          </p>
        </header>

        {!originalImage ? (
          <ImageUploader />
        ) : (
          <ImageEditor />
        )}
      </div>
    </main>
  )
}