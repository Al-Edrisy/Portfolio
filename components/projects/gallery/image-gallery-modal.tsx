"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  Move,
  Hand
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageGalleryModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onIndexChange?: (index: number) => void
  className?: string
}

export function ImageGalleryModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  className
}: ImageGalleryModalProps) {
  const [index, setIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Update index when currentIndex prop changes
  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

  // Reset zoom and rotation when image changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setDragOffset({ x: 0, y: 0 })
  }, [index])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case 'Home':
          e.preventDefault()
          goToFirst()
          break
        case 'End':
          e.preventDefault()
          goToLast()
          break
        case '+':
        case '=':
          e.preventDefault()
          setZoom(prev => Math.min(prev + 0.25, 3))
          break
        case '-':
          e.preventDefault()
          setZoom(prev => Math.max(prev - 0.25, 0.25))
          break
        case '0':
          e.preventDefault()
          setZoom(1)
          setRotation(0)
          setDragOffset({ x: 0, y: 0 })
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setRotation(prev => (prev + 90) % 360)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, index, images.length])

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return
    const newIndex = (index - 1 + images.length) % images.length
    setIndex(newIndex)
    onIndexChange?.(newIndex)
  }, [index, images.length, onIndexChange])

  const goToNext = useCallback(() => {
    if (images.length <= 1) return
    const newIndex = (index + 1) % images.length
    setIndex(newIndex)
    onIndexChange?.(newIndex)
  }, [index, images.length, onIndexChange])

  const goToFirst = useCallback(() => {
    setIndex(0)
    onIndexChange?.(0)
  }, [onIndexChange])

  const goToLast = useCallback(() => {
    const lastIndex = images.length - 1
    setIndex(lastIndex)
    onIndexChange?.(lastIndex)
  }, [images.length, onIndexChange])

  // Image loading handlers
  const handleImageLoad = (imgIndex: number) => {
    setLoadedImages(prev => new Set([...prev, imgIndex]))
    setErrors(prev => {
      const newErrors = new Set(prev)
      newErrors.delete(imgIndex)
      return newErrors
    })
    setIsLoading(false)
  }

  const handleImageError = (imgIndex: number) => {
    setErrors(prev => new Set([...prev, imgIndex]))
    setIsLoading(false)
  }

  // Zoom and pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)))
  }

  const handlePanStart = () => {
    setIsDragging(true)
  }

  const handlePan = (event: any, info: PanInfo) => {
    if (zoom > 1) {
      setDragOffset(prev => ({
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y
      }))
    }
  }

  const handlePanEnd = () => {
    setIsDragging(false)
  }

  // Download handler
  const handleDownload = async () => {
    try {
      const imageUrl = images[index]
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `image-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(images[index], '_blank')
  }

  const currentImage = images[index]
  const hasError = errors.has(index)
  const isLoaded = loadedImages.has(index)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-black/90 backdrop-blur-sm",
            className
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {index + 1} of {images.length}
              </h3>
              {isDragging && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Move className="w-4 h-4" />
                  <span>Dragging</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="text-white hover:bg-white/20"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div 
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center p-16"
            onWheel={handleWheel}
          >
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <motion.div
              drag={zoom > 1}
              dragConstraints={containerRef}
              onDragStart={handlePanStart}
              onDrag={handlePan}
              onDragEnd={handlePanEnd}
              dragElastic={0}
              className="relative max-w-full max-h-full"
            >
              {isLoading && !isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}

              {hasError && (
                <div className="flex items-center justify-center w-96 h-96 text-white">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Failed to load image</p>
                    <p className="text-sm text-gray-400 mt-2">Image may be unavailable or corrupted</p>
                  </div>
                </div>
              )}

              {!hasError && (
                <motion.img
                  ref={imageRef}
                  key={index}
                  src={currentImage}
                  alt={`Gallery image ${index + 1}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  className={cn(
                    "max-w-full max-h-full object-contain",
                    "transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0",
                    zoom > 1 ? "cursor-move" : "cursor-default"
                  )}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                    transformOrigin: 'center center'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoaded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 max-w-xs overflow-x-auto">
                {images.map((image, imgIndex) => (
                  <button
                    key={imgIndex}
                    onClick={() => {
                      setIndex(imgIndex)
                      onIndexChange?.(imgIndex)
                    }}
                    className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2",
                      imgIndex === index 
                        ? "border-white" 
                        : "border-gray-600 hover:border-gray-400"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Zoom and Rotation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
                disabled={zoom <= 0.25}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className="text-sm min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(1)
                  setRotation(0)
                  setDragOffset({ x: 0, y: 0 })
                }}
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5">
            <div className="text-center text-white/50 text-sm pointer-events-none">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Hand className="w-4 h-4" />
                <span>Use mouse wheel to zoom</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Move className="w-4 h-4" />
                <span>Drag to pan when zoomed</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing gallery modal state
export function useImageGalleryModal(images: string[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openModal = useCallback((index: number = 0) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const nextImage = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex(prev => (prev + 1) % images.length)
  }, [images.length])

  const previousImage = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  return {
    isOpen,
    currentIndex,
    openModal,
    closeModal,
    nextImage,
    previousImage
  }
}
