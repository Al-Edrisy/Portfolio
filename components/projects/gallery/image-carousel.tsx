"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
  images: string[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
  showThumbnails?: boolean
  transitionDuration?: number
  onImageChange?: (index: number) => void
  defaultImage?: number
}

export function ImageCarousel({
  images,
  className,
  autoPlay = true,
  autoPlayInterval = 4000,
  showControls = true,
  showIndicators = true,
  showThumbnails = false,
  transitionDuration = 0.5,
  onImageChange,
  defaultImage = 0
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(defaultImage)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, autoPlayInterval, images.length])

  // Notify parent of index changes
  useEffect(() => {
    onImageChange?.(currentIndex)
  }, [currentIndex, onImageChange])

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

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Play/pause controls
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  // Touch/drag handling
  const handleDragStart = (event: any, info: PanInfo) => {
    setIsDragging(true)
    setDragStart(info.point.x)
    setIsPlaying(false) // Pause auto-play while dragging
  }

  const handleDrag = (event: any, info: PanInfo) => {
    // Optional: Add visual feedback during drag
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    const threshold = 50 // Minimum drag distance to trigger navigation
    const dragDistance = info.point.x - dragStart

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }
    
    // Resume auto-play after a delay
    setTimeout(() => {
      if (autoPlay) {
        setIsPlaying(true)
      }
    }, 1000)
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
        case ' ':
          e.preventDefault()
          togglePlayPause()
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
    <div className={cn("relative group", className)}>
      {/* Main Carousel Container */}
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

        {/* Image with Drag Support */}
        {!hasError && (
          <motion.div
            ref={containerRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="w-full h-full"
          >
            <motion.img
              key={currentIndex}
              src={currentImage}
              alt={`Carousel image ${currentIndex + 1}`}
              onLoad={() => handleImageLoad(currentIndex)}
              onError={() => handleImageError(currentIndex)}
              className={cn(
                "w-full h-full object-cover select-none",
                "transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: 0 }}
              transition={{ duration: transitionDuration }}
              draggable={false}
            />
          </motion.div>
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

        {/* Play/Pause Button */}
        {showControls && autoPlay && (
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePlayPause}
            className={cn(
              "absolute top-4 left-4 z-20",
              "bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
            )}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Drag Instruction */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Drag to navigate
          </div>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-blue-500 w-8" 
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
            />
          ))}
        </div>
      )}

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
            </button>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && images.length > 1 && (
        <div className="mt-3 relative">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
              key={currentIndex} // Reset animation on image change
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Compact carousel for cards
interface CompactCarouselProps {
  images: string[]
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function CompactCarousel({
  images,
  className,
  aspectRatio = 'video',
  autoPlay = true,
  autoPlayInterval = 3000
}: CompactCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

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
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
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

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{images.length}
          </div>
        )}
      </div>
    </div>
  )
}
