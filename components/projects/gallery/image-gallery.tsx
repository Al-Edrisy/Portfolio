"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageGalleryProps {
  images: string[]
  className?: string
  showThumbnails?: boolean
  showControls?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  onImageClick?: (index: number) => void
  defaultImage?: number
}

export function ImageGallery({
  images,
  className,
  showThumbnails = true,
  showControls = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onImageClick,
  defaultImage = 0
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(defaultImage)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout>()

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, images.length])

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (autoPlay && intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (autoPlay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
    }
  }

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Image loading handlers
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
    setErrors(prev => {
      const newErrors = new Set(prev)
      newErrors.delete(index)
      return newErrors
    })
    setIsLoading(false)
  }

  const handleImageError = (index: number) => {
    setErrors(prev => new Set([...prev, index]))
    setIsLoading(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case 'Escape':
          e.preventDefault()
          // Could close gallery if in modal
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, images.length])

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 rounded-lg",
        "bg-gray-100 dark:bg-gray-800",
        "text-gray-500 dark:text-gray-400",
        className
      )}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No images to display</p>
        </div>
      </div>
    )
  }

  const currentImage = images[currentIndex]
  const hasError = errors.has(currentIndex)
  const isLoaded = loadedImages.has(currentIndex)

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Loading State */}
        {isLoading && !isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Failed to load image</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        {!hasError && (
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Gallery image ${currentIndex + 1}`}
            onLoad={() => handleImageLoad(currentIndex)}
            onError={() => handleImageError(currentIndex)}
            className={cn(
              "w-full h-full object-cover cursor-pointer",
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onClick={() => onImageClick?.(currentIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Navigation Arrows */}
        {showControls && images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToPrevious}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-20",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={goToNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-20",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Auto-play Indicator */}
        {autoPlay && images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Auto-playing
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden",
                "border-2 transition-all duration-200",
                index === currentIndex 
                  ? "border-blue-500 ring-2 ring-blue-200" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              
              {/* Loading indicator for thumbnails */}
              {!loadedImages.has(index) && !errors.has(index) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}

              {/* Error indicator for thumbnails */}
              {errors.has(index) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      {autoPlay && images.length > 1 && (
        <div className="mt-3 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-blue-500" 
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Compact version for cards
interface CompactImageGalleryProps {
  images: string[]
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
  onImageClick?: (index: number) => void
}

export function CompactImageGallery({
  images,
  className,
  aspectRatio = 'video',
  onImageClick
}: CompactImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]'
  }

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800",
        aspectClasses[aspectRatio]
      )}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onImageClick?.(currentIndex)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Navigation dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-white" 
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      </div>
    </div>
  )
}
