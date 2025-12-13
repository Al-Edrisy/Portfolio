"use client"

import { useState, useCallback, memo } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  onClick?: (e: React.MouseEvent) => void
  loading?: 'lazy' | 'eager'
  onError?: (url: string) => void
}

/**
 * Image component with error handling and fallback placeholder
 * 
 * Implements Requirements 4.4: IF an image URL fails to load THEN the System 
 * SHALL display a placeholder and continue showing other images
 */
export const ImageWithFallback = memo(function ImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  onClick,
  loading = 'lazy',
  onError,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    onError?.(src)
  }, [src, onError])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          containerClassName
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span className="text-[10px]">Failed to load</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", containerClassName)} onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-muted-foreground text-xs">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
})

export default ImageWithFallback
