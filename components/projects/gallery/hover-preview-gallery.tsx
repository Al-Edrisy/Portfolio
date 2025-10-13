"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ImageGalleryModal } from './image-gallery-modal'

interface HoverPreviewGalleryProps {
  images: string[]
  projectTitle: string
  aspectRatio?: "video" | "square" | "auto"
  className?: string
  showViewAllButton?: boolean
}

export function HoverPreviewGallery({
  images,
  projectTitle,
  aspectRatio = "video",
  className,
  showViewAllButton = true
}: HoverPreviewGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentImageIndex]

  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square", 
    auto: "aspect-auto"
  }

  const handleThumbnailHover = (index: number) => {
    setCurrentImageIndex(index)
    setHoveredThumbnail(index)
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Display */}
      <div className="relative group">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "relative overflow-hidden rounded-lg bg-muted cursor-pointer",
            aspectRatioClasses[aspectRatio]
          )}
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={currentImage}
            alt={`${projectTitle} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay with view hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                {images.length > 1 ? `View ${images.length} images` : 'View image'}
              </span>
            </div>
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </motion.div>

        {/* Cover badge for first image */}
        {currentImageIndex === 0 && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Cover
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hover to preview • Click to view full size
            </p>
            {showViewAllButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-xs"
              >
                View All ({images.length})
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200",
                  index === currentImageIndex 
                    ? "border-primary scale-105 shadow-md" 
                    : "border-transparent opacity-70 hover:opacity-100",
                  hoveredThumbnail === index && "scale-105"
                )}
                onMouseEnter={() => handleThumbnailHover(index)}
                onMouseLeave={() => setHoveredThumbnail(null)}
                onClick={() => handleThumbnailClick(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image}
                  alt={`${projectTitle} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Thumbnail indicator */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded text-[10px] font-bold">
                    C
                  </div>
                )}
                
                {/* Active indicator */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-md" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Full Gallery Modal */}
      <ImageGalleryModal
        images={images}
        initialIndex={currentImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectTitle={projectTitle}
      />
    </div>
  )
}
