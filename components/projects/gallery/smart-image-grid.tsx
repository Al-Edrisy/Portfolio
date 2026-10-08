"use client"

import { useState, useCallback, memo } from 'react'
import { ImageOff, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filterFailedImages, type ImageErrorState } from '@/lib/utils/image-helpers'

interface SmartImageGridProps {
  images: string[]
  projectTitle: string
  onImageClick?: (e: React.MouseEvent, index: number) => void
  imageRef?: React.RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Single image with error handling
 */
const GridImage = memo(function GridImage({
  src,
  alt,
  className,
  onError,
  hasError,
}: {
  src: string
  alt: string
  className?: string
  onError: () => void
  hasError: boolean
}) {
  if (hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/50 w-full h-full", className)}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-[10px]">Unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={onError}
    />
  )
})

/**
 * Smart Image Grid with streamlined feed presentation
 * Supports 1, 2, 3, or 4+ images with clean layouts
 */
export const SmartImageGrid = memo(function SmartImageGrid({
  images,
  projectTitle,
  onImageClick,
  imageRef,
  className
}: SmartImageGridProps) {
  const [errorState, setErrorState] = useState<ImageErrorState>({})

  const handleImageError = useCallback((url: string) => {
    setErrorState(prev => ({ ...prev, [url]: true }))
  }, [])

  const handleClick = useCallback((e: React.MouseEvent, index: number) => {
    if (onImageClick) {
      onImageClick(e, index)
    } else {
      // Default: Cleanly open full-res in new tab if user wants to inspect
      e.stopPropagation()
      if (images[index]) {
        window.open(images[index], '_blank', 'noopener,noreferrer')
      }
    }
  }, [onImageClick, images])

  const validImages = filterFailedImages(images, errorState)
  const displayCount = validImages.length

  if (displayCount === 0 && images.length > 0) {
    return (
      <div className={cn("relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">Images unavailable</span>
        </div>
      </div>
    )
  }

  // Single image layout
  if (images.length === 1) {
    return (
      <div
        className={cn(
          "relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-muted/20 border border-border/50 group/image cursor-pointer",
          className
        )}
        onClick={(e) => handleClick(e, 0)}
      >
        <div ref={imageRef as React.RefObject<HTMLDivElement>} className="w-full h-full">
          <GridImage
            src={images[0]}
            alt={projectTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-[1.02]"
            onError={() => handleImageError(images[0])}
            hasError={!!errorState[images[0]]}
          />
        </div>
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover/image:opacity-100 transition-opacity">
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    )
  }

  // Multiple images - smart grid
  return (
    <div
      ref={imageRef as React.RefObject<HTMLDivElement>}
      className={cn(
        "relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-border/50 cursor-pointer group/image",
        className
      )}
    >
      {images.length === 2 ? (
        // 2 Images: Split 50/50
        <div className="flex h-full w-full gap-1">
          {images.slice(0, 2).map((img, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden relative"
              onClick={(e) => handleClick(e, i)}
            >
              <GridImage
                src={img}
                alt={`${projectTitle} ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                onError={() => handleImageError(img)}
                hasError={!!errorState[img]}
              />
            </div>
          ))}
        </div>
      ) : images.length === 3 ? (
        // 3 Images: 1 Main (65%), 2 Stacked (35%)
        <div className="flex h-full w-full gap-1">
          <div
            className="w-[65%] overflow-hidden relative"
            onClick={(e) => handleClick(e, 0)}
          >
            <GridImage
              src={images[0]}
              alt={`${projectTitle} 1`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              onError={() => handleImageError(images[0])}
              hasError={!!errorState[images[0]]}
            />
          </div>
          <div className="w-[35%] flex flex-col gap-1">
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="flex-1 overflow-hidden relative"
                onClick={(e) => handleClick(e, i + 1)}
              >
                <GridImage
                  src={img}
                  alt={`${projectTitle} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                  onError={() => handleImageError(img)}
                  hasError={!!errorState[img]}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 4+ Images: 1 Main (Left), 2 Stacked (Right) with overflow indicator
        <div className="flex h-full w-full gap-1">
          <div
            className="flex-1 overflow-hidden relative"
            onClick={(e) => handleClick(e, 0)}
          >
            <GridImage
              src={images[0]}
              alt={`${projectTitle} 1`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              onError={() => handleImageError(images[0])}
              hasError={!!errorState[images[0]]}
            />
          </div>
          <div className="w-[35%] flex flex-col gap-1">
            <div
              className="flex-1 overflow-hidden relative"
              onClick={(e) => handleClick(e, 1)}
            >
              <GridImage
                src={images[1]}
                alt={`${projectTitle} 2`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                onError={() => handleImageError(images[1])}
                hasError={!!errorState[images[1]]}
              />
            </div>
            <div
              className="flex-1 overflow-hidden relative"
              onClick={(e) => handleClick(e, 2)}
            >
              <GridImage
                src={images[2]}
                alt={`${projectTitle} 3`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                onError={() => handleImageError(images[2])}
                hasError={!!errorState[images[2]]}
              />
              {images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-xs font-semibold">+{images.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default SmartImageGrid
