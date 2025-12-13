"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { 
  Image, 
  Link, 
  Plus, 
  X, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ImageUrlInputProps {
  value: string
  onChange: (url: string) => void
  onAddImage?: (url: string) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  allowMultiple?: boolean
  maxImages?: number
  disabled?: boolean
}

interface ImagePreviewProps {
  url: string
  onRemove?: () => void
  className?: string
}

function ImagePreview({ url, onRemove, className }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "relative group rounded-lg overflow-hidden",
        "border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span className="text-sm">Failed to load image</span>
          </div>
        ) : (
          <img
            src={url}
            alt="Preview"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />

      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          {onRemove && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* URL Display */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-xs truncate">{url}</p>
      </div>
    </motion.div>
  )
}

export function ImageUrlInput({
  value,
  onChange,
  onAddImage,
  placeholder = "Enter image URL...",
  className,
  showPreview = true,
  allowMultiple = true,
  maxImages = 10,
  disabled = false
}: ImageUrlInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url.trim()) return false
    
    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return false
    }

    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    )

    // For URLs without clear extensions (like from CDNs), we'll trust the user
    return hasImageExtension || url.includes('image') || url.includes('photo')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = value.trim()
    if (!url) return

    setIsValidating(true)
    setValidationError(null)

    try {
      const isValid = await validateImageUrl(url)
      
      if (isValid) {
        onAddImage?.(url)
        onChange('') // Clear input
      } else {
        setValidationError('Please enter a valid image URL')
      }
    } catch (error) {
      setValidationError('Invalid URL format')
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    
    // If it looks like a URL, validate it
    if (pastedText.includes('http') && pastedText.includes('.')) {
      e.preventDefault()
      onChange(pastedText)
      
      // Auto-validate pasted URLs
      setIsValidating(true)
      const isValid = await validateImageUrl(pastedText)
      if (isValid) {
        onAddImage?.(pastedText)
        onChange('')
      } else {
        setValidationError('Pasted URL doesn\'t appear to be an image')
      }
      setIsValidating(false)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Link className="w-4 h-4 text-gray-400" />
          </div>
          
          <Input
            ref={inputRef}
            type="url"
            value={value}
            onChange={handleInputChange}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={isValidating || disabled}
            className={cn(
              "pl-10 pr-20",
              validationError && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim() || isValidating || disabled}
                className="h-8 px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>

        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </motion.div>
        )}
      </form>

      {/* URL Validation Helper */}
      {value && !validationError && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Press Enter or click Add to add this image</span>
        </div>
      )}
    </div>
  )
}

// Draggable image item component for reorder functionality
interface DraggableImageItemProps {
  url: string
  index: number
  onRemove: () => void
}

function DraggableImageItem({ url, index, onRemove }: DraggableImageItemProps) {
  const dragControls = useDragControls()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <Reorder.Item
      value={url}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      <div
        className={cn(
          "relative rounded-lg overflow-hidden",
          "border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800"
        )}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing bg-black/50 hover:bg-black/70 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Cover Image Indicator */}
        {index === 0 && (
          <div className="absolute top-2 left-10 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
            Cover
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-sm">Failed to load image</span>
            </div>
          ) : (
            <img
              src={url}
              alt="Preview"
              onLoad={() => { setIsLoading(false); setHasError(false) }}
              onError={() => { setIsLoading(false); setHasError(true) }}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-200",
                isLoading ? "opacity-0" : "opacity-100"
              )}
            />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 pointer-events-none" />

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* URL Display */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs truncate">{url}</p>
        </div>
      </div>
    </Reorder.Item>
  )
}

// Gallery display component for multiple images
interface ImageGalleryInputProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  className?: string
  maxImages?: number
}

/**
 * Checks if a URL already exists in the images array (duplicate prevention)
 * Property 5: Duplicate Prevention - attempting to add a URL that already exists SHALL leave the array unchanged
 */
export function isDuplicateUrl(images: string[], url: string): boolean {
  return images.includes(url)
}

/**
 * Checks if the images array has reached the maximum limit
 * Property 1: Image Array Size Constraint - array length SHALL be between 0 and maxImages (inclusive)
 */
export function isAtMaxImages(images: string[], maxImages: number): boolean {
  return images.length >= maxImages
}

export function ImageGalleryInput({
  images,
  onImagesChange,
  className,
  maxImages = 10
}: ImageGalleryInputProps) {
  const [inputUrl, setInputUrl] = useState('')
  
  const isLimitReached = isAtMaxImages(images, maxImages)

  const handleAddImage = (url: string) => {
    // Property 1: Image Array Size Constraint - reject if at max
    if (isLimitReached) {
      toast.error('Maximum images reached', {
        description: `You can only add up to ${maxImages} images per project.`
      })
      return
    }
    
    // Property 5: Duplicate Prevention - reject if duplicate
    if (isDuplicateUrl(images, url)) {
      toast.warning('Duplicate image', {
        description: 'This image URL has already been added to the gallery.'
      })
      return
    }
    
    onImagesChange([...images, url])
    toast.success('Image added', {
      description: 'The image has been added to your gallery.'
    })
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  // Property 3: Reorder Preserves Cover - reorder updates array with first element as cover
  const handleReorder = (newOrder: string[]) => {
    onImagesChange(newOrder)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input */}
      <div className="space-y-2">
        <ImageUrlInput
          value={inputUrl}
          onChange={setInputUrl}
          onAddImage={handleAddImage}
          placeholder={isLimitReached ? "Maximum images reached" : "Add image URL..."}
          showPreview={false}
          disabled={isLimitReached}
        />
        
        {/* Limit indicator when approaching max */}
        {images.length >= maxImages - 2 && images.length < maxImages && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ You can add {maxImages - images.length} more image{maxImages - images.length !== 1 ? 's' : ''}
          </p>
        )}
        
        {/* Disabled state message */}
        {isLimitReached && (
          <p className="text-xs text-red-500">
            Maximum of {maxImages} images reached. Remove an image to add more.
          </p>
        )}
      </div>

      {/* Gallery with drag-and-drop reorder */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Images ({images.length})
            </h4>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              isLimitReached 
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : images.length >= maxImages - 2
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {images.length}/{maxImages}
            </span>
          </div>

          <Reorder.Group
            axis="x"
            values={images}
            onReorder={handleReorder}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {images.map((url, index) => (
              <DraggableImageItem
                key={url}
                url={url}
                index={index}
                onRemove={() => handleRemoveImage(index)}
              />
            ))}
          </Reorder.Group>

          {/* Reorder Instructions */}
          {images.length > 1 && (
            <p className="text-xs text-gray-500 text-center">
              💡 Drag images to reorder. First image will be used as the cover image.
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No images added yet</p>
          <p className="text-xs text-gray-400">Add image URLs above to get started</p>
        </div>
      )}
    </div>
  )
}
