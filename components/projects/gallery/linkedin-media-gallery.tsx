"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LinkedInMediaGalleryProps {
  images: string[]
  videos?: string[]
  className?: string
}

export function LinkedInMediaGallery({ 
  images = [], 
  videos = [], 
  className 
}: LinkedInMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)

  const allMedia = [
    ...images.map((src, index) => ({ type: 'image', src, index })),
    ...videos.map((src, index) => ({ type: 'video', src, index: index + images.length }))
  ]

  const handleMediaClick = (index: number) => {
    setSelectedIndex(index)
    setIsFullscreen(true)
  }

  const handleClose = () => {
    setIsFullscreen(false)
    setSelectedIndex(null)
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : allMedia.length - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex < allMedia.length - 1 ? selectedIndex + 1 : 0)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return
      
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, selectedIndex])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  if (allMedia.length === 0) return null

  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count === 3) return 'grid-cols-2 grid-rows-2'
    if (count === 4) return 'grid-cols-2 grid-rows-2'
    return 'grid-cols-2 grid-rows-2'
  }

  const renderMediaItem = (media: { type: string; src: string; index: number }, itemIndex: number) => {
    const isLastItem = itemIndex === allMedia.length - 1
    const remainingCount = allMedia.length - 4

    return (
      <motion.div
        key={itemIndex}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-lg",
          itemIndex === 3 && allMedia.length > 4 ? "bg-black/50" : ""
        )}
        onClick={() => handleMediaClick(itemIndex)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {media.type === 'image' ? (
          <img
            src={media.src}
            alt={`Media ${itemIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            <video
              src={media.src}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
        
        {/* Overlay for last item with count */}
        {itemIndex === 3 && allMedia.length > 4 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-2xl font-bold">
              +{remainingCount}
            </div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900"
              onClick={(e) => {
                e.stopPropagation()
                window.open(media.src, '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {/* Media Grid */}
      <div 
        ref={galleryRef}
        className={cn(
          "grid gap-2 rounded-lg overflow-hidden",
          getGridLayout(Math.min(allMedia.length, 4)),
          className
        )}
      >
        {allMedia.slice(0, 4).map((media, index) => renderMediaItem(media, index))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={handleClose}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
                onClick={handleClose}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {allMedia.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevious()
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Media Content */}
              <div 
                className="relative max-w-4xl max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                {allMedia[selectedIndex].type === 'image' ? (
                  <img
                    src={allMedia[selectedIndex].src}
                    alt={`Media ${selectedIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={allMedia[selectedIndex].src}
                    className="max-w-full max-h-full rounded-lg"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Media Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                {selectedIndex + 1} / {allMedia.length}
              </div>

              {/* Download Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  const link = document.createElement('a')
                  link.href = allMedia[selectedIndex].src
                  link.download = `media-${selectedIndex + 1}`
                  link.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
