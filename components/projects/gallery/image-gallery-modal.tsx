"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageGalleryModalProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  projectTitle?: string
}

export function ImageGalleryModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  projectTitle = 'Project'
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Reset zoom when changing images
  useEffect(() => {
    setZoom(1)
  }, [currentIndex])

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, zoom])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${projectTitle}-image-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Swipe handling
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold) {
      handlePrevious()
    } else if (info.offset.x < -swipeThreshold) {
      handleNext()
    }
  }

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            {projectTitle && (
              <span className="text-sm text-gray-300 hidden sm:inline">
                • {projectTitle}
              </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              disabled={zoom >= 3}
                className="text-white hover:bg-white/20"
              >
              <ZoomIn className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                toggleFullscreen()
              }}
              className="text-white hover:bg-white/20 hidden sm:flex"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            
              <Button
                variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
                className="text-white hover:bg-white/20"
              >
              <Download className="h-5 w-5" />
              </Button>
            
              <Button
                variant="ghost"
              size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
              <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

        {/* Main Image */}
        <div 
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            key={currentIndex}
            drag={zoom === 1}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative max-w-full max-h-full cursor-grab active:cursor-grabbing",
              isFullscreen && "w-full h-full"
            )}
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transition: 'transform 0.2s ease-out'
            }}
          >
            <img
              src={currentImage}
              alt={`${projectTitle} - Image ${currentIndex + 1}`}
              className={cn(
                "max-w-full max-h-full object-contain select-none",
                isFullscreen ? "w-full h-full object-cover" : ""
              )}
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all",
                    "border-2",
                    index === currentIndex
                      ? "border-white scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={image}
                    alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>
        )}
        </motion.div>
    </AnimatePresence>
  )
}

// Custom hook for managing lightbox state
export function useImageGalleryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openAt = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    currentIndex,
    openAt,
    close,
    setIsOpen,
    setCurrentIndex
  }
}
