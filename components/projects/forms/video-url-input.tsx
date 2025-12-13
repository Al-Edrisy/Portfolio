"use client"

import { useState, useCallback, memo } from 'react'
import { Video, X, Plus, ExternalLink, AlertCircle, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { parseVideoUrl, getVideoSourceName, getVideoSourceStyle, isValidVideoUrl } from '@/lib/utils/video-helpers'

interface VideoUrlInputProps {
  videoUrl?: string
  onVideoChange: (url: string | undefined) => void
  pendingUrl?: string
  onPendingUrlChange?: (url: string) => void
  className?: string
}

export const VideoUrlInput = memo(function VideoUrlInput({
  videoUrl,
  onVideoChange,
  pendingUrl,
  onPendingUrlChange,
  className
}: VideoUrlInputProps) {
  const [localInputValue, setLocalInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const inputValue = pendingUrl !== undefined ? pendingUrl : localInputValue

  const handleInputChange = (value: string) => {
    if (onPendingUrlChange) {
      onPendingUrlChange(value)
    } else {
      setLocalInputValue(value)
    }
    setError(null)
  }

  const parsedVideo = videoUrl ? parseVideoUrl(videoUrl) : null

  const handleAddVideo = useCallback(() => {
    if (!inputValue.trim()) {
      setError('Please enter a video URL')
      return
    }

    const parsed = parseVideoUrl(inputValue.trim())

    if (!parsed.isValid) {
      setError('Invalid video URL. Supported: YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct video files (.mp4, .webm)')
      return
    }

    onVideoChange(inputValue.trim())
    handleInputChange('')
    setError(null)
  }, [inputValue, onVideoChange, onPendingUrlChange])

  const handleRemoveVideo = useCallback(() => {
    onVideoChange(undefined)
  }, [onVideoChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddVideo()
    }
  }, [handleAddVideo])

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Project Video</Label>
        <span className="text-xs text-muted-foreground">(optional)</span>
      </div>

      {/* Current video display */}
      {parsedVideo && (
        <div className="relative rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-start gap-3">
            {/* Thumbnail or placeholder */}
            <div className="relative w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
              {parsedVideo.thumbnailUrl ? (
                <img
                  src={parsedVideo.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getVideoSourceStyle(parsedVideo.source).bgColor)}
                >
                  {getVideoSourceName(parsedVideo.source)}
                </Badge>
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {parsedVideo.originalUrl}
              </p>
              <a
                href={parsedVideo.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open video
              </a>
            </div>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={handleRemoveVideo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add video input */}
      {!videoUrl && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Paste video URL (YouTube, Vimeo, LinkedIn, Facebook, etc.)"
              value={inputValue}
              onChange={(e) => {
                handleInputChange(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => inputValue.trim() && handleAddVideo()}
              className={cn(error && "border-destructive")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVideo}
              className="gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Supported: YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct video files (.mp4, .webm)
          </p>
        </div>
      )}
    </div>
  )
})

export default VideoUrlInput
