"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageTransitionProps {
  images: string[]
  currentIndex: number
  className?: string
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' | 'cube' | 'wipe'
  duration?: number
  direction?: 'horizontal' | 'vertical'
  onImageLoad?: (index: number) => void
  onImageError?: (index: number) => void
}

// Transition variants for different effects
const transitionVariants: Record<string, Variants> = {
  fade: {
    enter: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    enter: (direction: string) => ({
      x: direction === 'horizontal' ? 0 : 0,
      y: direction === 'vertical' ? 0 : 0,
      opacity: 1
    }),
    exit: (direction: string) => ({
      x: direction === 'horizontal' ? -300 : 0,
      y: direction === 'vertical' ? -300 : 0,
      opacity: 0
    })
  },
  scale: {
    enter: { 
      scale: 1, 
      opacity: 1,
      rotate: 0
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      rotate: -10
    }
  },
  flip: {
    enter: {
      rotateY: 0,
      opacity: 1
    },
    exit: {
      rotateY: 90,
      opacity: 0
    }
  },
  cube: {
    enter: {
      rotateX: 0,
      rotateY: 0,
      opacity: 1
    },
    exit: {
      rotateX: -90,
      rotateY: -90,
      opacity: 0
    }
  },
  wipe: {
    enter: (direction: string) => ({
      clipPath: direction === 'horizontal' 
        ? 'inset(0 0 0 0)' 
        : 'inset(0 0 0 0)',
      opacity: 1
    }),
    exit: (direction: string) => ({
      clipPath: direction === 'horizontal'
        ? 'inset(0 0 0 100%)'
        : 'inset(100% 0 0 0)',
      opacity: 0
    })
  }
}

export function ImageTransition({
  images,
  currentIndex,
  className,
  transitionType = 'fade',
  duration = 0.5,
  direction = 'horizontal',
  onImageLoad,
  onImageError
}: ImageTransitionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Set<number>>(new Set())

  const currentImage = images[currentIndex]
  const hasError = errors.has(currentIndex)
  const isLoaded = loadedImages.has(currentIndex)

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
    setErrors(prev => {
      const newErrors = new Set(prev)
      newErrors.delete(index)
      return newErrors
    })
    setIsLoading(false)
    onImageLoad?.(index)
  }

  const handleImageError = (index: number) => {
    setErrors(prev => new Set([...prev, index]))
    setIsLoading(false)
    onImageError?.(index)
  }

  // Get the appropriate variants for the transition type
  const variants = transitionVariants[transitionType] || transitionVariants.fade

  return (
    <div className={cn("relative overflow-hidden", className)}>
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

      {/* Image with Transition */}
      {!hasError && (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Transition image ${currentIndex + 1}`}
            onLoad={() => handleImageLoad(currentIndex)}
            onError={() => handleImageError(currentIndex)}
            className={cn(
              "w-full h-full object-cover",
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            custom={direction}
            variants={variants}
            initial="exit"
            animate="enter"
            exit="exit"
            transition={{
              duration: duration,
              ease: "easeInOut"
            }}
            style={{
              // Additional styles for specific transition types
              ...(transitionType === 'cube' && {
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }),
              ...(transitionType === 'flip' && {
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              })
            }}
          />
        </AnimatePresence>
      )}
    </div>
  )
}

// Advanced transition component with multiple effects
interface AdvancedImageTransitionProps {
  images: string[]
  currentIndex: number
  className?: string
  effects?: Array<{
    type: 'fade' | 'slide' | 'scale' | 'flip' | 'cube' | 'wipe'
    duration?: number
    direction?: 'horizontal' | 'vertical'
  }>
  randomTransition?: boolean
}

export function AdvancedImageTransition({
  images,
  currentIndex,
  className,
  effects = [
    { type: 'fade', duration: 0.5 },
    { type: 'slide', duration: 0.6, direction: 'horizontal' },
    { type: 'scale', duration: 0.4 }
  ],
  randomTransition = false
}: AdvancedImageTransitionProps) {
  const [currentEffect, setCurrentEffect] = useState(0)
  const [prevIndex, setPrevIndex] = useState(currentIndex)

  // Change effect when image changes
  useEffect(() => {
    if (currentIndex !== prevIndex) {
      if (randomTransition) {
        setCurrentEffect(Math.floor(Math.random() * effects.length))
      } else {
        setCurrentEffect(prev => (prev + 1) % effects.length)
      }
      setPrevIndex(currentIndex)
    }
  }, [currentIndex, prevIndex, randomTransition, effects.length])

  const effect = effects[currentEffect]

  return (
    <ImageTransition
      images={images}
      currentIndex={currentIndex}
      className={className}
      transitionType={effect.type}
      duration={effect.duration}
      direction={effect.direction}
    />
  )
}

// Transition wrapper for easy integration
interface TransitionWrapperProps {
  children: React.ReactNode
  transitionKey: string | number
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' | 'cube' | 'wipe'
  duration?: number
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export function TransitionWrapper({
  children,
  transitionKey,
  transitionType = 'fade',
  duration = 0.3,
  direction = 'horizontal',
  className
}: TransitionWrapperProps) {
  const variants = transitionVariants[transitionType] || transitionVariants.fade

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        className={className}
        custom={direction}
        variants={variants}
        initial="exit"
        animate="enter"
        exit="exit"
        transition={{
          duration: duration,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Pre-built transition presets
export const transitionPresets = {
  smooth: {
    type: 'fade' as const,
    duration: 0.5
  },
  energetic: {
    type: 'scale' as const,
    duration: 0.3
  },
  dramatic: {
    type: 'flip' as const,
    duration: 0.8
  },
  modern: {
    type: 'slide' as const,
    duration: 0.4,
    direction: 'horizontal' as const
  },
  playful: {
    type: 'cube' as const,
    duration: 0.6
  },
  cinematic: {
    type: 'wipe' as const,
    duration: 0.7,
    direction: 'horizontal' as const
  }
}
