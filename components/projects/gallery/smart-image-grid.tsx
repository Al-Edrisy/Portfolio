"use client"

import { useState, useCallback, memo } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filterFailedImages, type ImageErrorState } from '@/lib/utils/image-helpers'

interface SmartImageGridProps {
  images: string[]
  projectTitle: string
  onImageClick: (e: React.MouseEvent, index: number) => void
  imageRef?: React.RefObject<HTMLDivElement>
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
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-[9px]">Failed</span>
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
 * Smart Image Grid with error handling
 * 
 * Implements Requirements 4.4: IF an image URL fails to load THEN the System 
 * SHALL display a placeholder and continue showing other images
 */
export const SmartImageGrid = memo(function SmartImageGrid({
  images,
  projectTitle,
  onImageClick,
  imageRef,
}: SmartImageGridProps) {
  const [errorState, setErrorState] = useState<ImageErrorState>({})

  const handleImageError = useCallback((url: string) => {
    setErrorState(prev => ({ ...prev, [url]: true }))
  }, [])

  // Get valid images for display (filter out failed ones for layout calculation)
  const validImages = filterFailedImages(images, errorState)
  const displayCount = validImages.length

  // If all images failed, show placeholder
  if (displayCount === 0 && images.length > 0) {
    return (
      <div className="relative w-full aspect-[2/1] overflow-hidden rounded-md bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Images unavailable</span>
        </div>
      </div>
    )
  }

  // Single image layout
  if (images.length === 1) {
    return (
      <div
        className="relative w-full aspect-[2/1] overflow-hidden rounded-md bg-muted group/image cursor-pointer"
        onClick={(e) => onImageClick(e, 0)}
      >
        <div ref={imageRef} className="w-full h-full">
          <GridImage
            src={images[0]}
            alt={projectTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
            onError={() => handleImageError(images[0])}
            hasError={!!errorState[images[0]]}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
      </div>
    )
  }

  // Multiple images - smart grid
  return (
    <div
      ref={imageRef}
      className="relative w-full aspect-[2/1] overflow-hidden rounded-md cursor-pointer group/image"
    >
      {images.length === 2 ? (
        // 2 Images: Split 50/50
        <div className="flex h-full w-full gap-0.5">
          {images.slice(0, 2).map((img, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden relative"
              onClick={(e) => onImageClick(e, i)}
            >
              <GridImage
                src={img}
                alt={`${projectTitle} ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                onError={() => handleImageError(img)}
                hasError={!!errorState[img]}
              />
              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      ) : images.length === 3 ? (
        // 3 Images: 1 Main (66%), 2 Stacked (33%)
        <div className="flex h-full w-full gap-0.5">
          <div
            className="w-2/3 overflow-hidden relative"
            onClick={(e) => onImageClick(e, 0)}
          >
            <GridImage
              src={images[0]}
              alt={`${projectTitle} 1`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              onError={() => handleImageError(images[0])}
              hasError={!!errorState[images[0]]}
            />
          </div>
          <div className="w-1/3 flex flex-col gap-0.5">
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="flex-1 overflow-hidden relative"
                onClick={(e) => onImageClick(e, i + 1)}
              >
                <GridImage
                  src={img}
                  alt={`${projectTitle} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                  onError={() => handleImageError(img)}
                  hasError={!!errorState[img]}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 4+ Images: 1 Main (Left), Grid (Right) with overflow indicator
        <div className="flex h-full w-full gap-0.5">
          <div
            className="flex-1 overflow-hidden relative"
            onClick={(e) => onImageClick(e, 0)}
          >
            <GridImage
              src={images[0]}
              alt={`${projectTitle} 1`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              onError={() => handleImageError(images[0])}
              hasError={!!errorState[images[0]]}
            />
          </div>
          <div className="w-1/3 flex flex-col gap-0.5">
            <div
              className="flex-1 overflow-hidden relative"
              onClick={(e) => onImageClick(e, 1)}
            >
              <GridImage
                src={images[1]}
                alt={`${projectTitle} 2`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                onError={() => handleImageError(images[1])}
                hasError={!!errorState[images[1]]}
              />
            </div>
            <div
              className="flex-1 overflow-hidden relative"
              onClick={(e) => onImageClick(e, 2)}
            >
              <GridImage
                src={images[2]}
                alt={`${projectTitle} 3`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                onError={() => handleImageError(images[2])}
                hasError={!!errorState[images[2]]}
              />
              {images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{images.length - 3}</span>
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
