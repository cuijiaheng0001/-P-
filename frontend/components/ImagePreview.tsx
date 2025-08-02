"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, ZoomOut, Move } from 'lucide-react'

interface ImagePreviewProps {
  originalUrl: string | null
  processedUrl: string | null
  showComparison: boolean
}

export function ImagePreview({ originalUrl, processedUrl, showComparison }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const displayUrl = processedUrl || originalUrl

  if (!displayUrl) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          {showComparison && processedUrl ? '效果对比' : '图片预览'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            title="拖动"
          >
            <Move className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="relative h-[600px] bg-gray-50 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showComparison && processedUrl && originalUrl ? (
          <div className="flex h-full">
            <div className="flex-1 relative border-r-2 border-white">
              <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                原图
              </div>
              <div 
                className="relative h-full flex items-center justify-center overflow-hidden"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                }}
              >
                <Image
                  src={originalUrl}
                  alt="原图"
                  width={600}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  draggable={false}
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                效果图
              </div>
              <div 
                className="relative h-full flex items-center justify-center overflow-hidden"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                }}
              >
                <Image
                  src={processedUrl}
                  alt="效果图"
                  width={600}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="relative h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
            }}
          >
            <Image
              src={displayUrl}
              alt="预览图"
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}