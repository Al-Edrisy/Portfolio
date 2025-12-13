"use client"

import { useState, memo } from 'react'
import { Play, ExternalLink, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseVideoUrl, getVideoSourceName, type VideoSource } from '@/lib/utils/video-helpers'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
  autoPlay?: boolean
  showControls?: boolean
}

/**
 * Universal video player component
 * Supports: YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, direct video files
 */
export const VideoPlayer = memo(function VideoPlayer({
  url,
  title = 'Project video',
  className,
  autoPlay = false,
  showControls = true
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [hasError, setHasError] = useState(false)
  
  const parsed = parseVideoUrl(url)

  if (!parsed.isValid || hasError) {
    return (
      <div className={cn(
        "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <Video className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Video unavailable</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Open original link
            </a>
          )}
        </div>
      </div>
    )
  }

  // YouTube embed
  if (parsed.source === 'youtube' && parsed.embedUrl) {
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
        {!isPlaying && parsed.thumbnailUrl ? (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={parsed.thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                {getVideoSourceName(parsed.source)}
              </span>
            </div>
          </div>
        ) : (
          <iframe
            src={`${parsed.embedUrl}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    )
  }

  // Vimeo embed
  if (parsed.source === 'vimeo' && parsed.embedUrl) {
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
        <iframe
          src={`${parsed.embedUrl}?autoplay=${autoPlay ? 1 : 0}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // Facebook embed
  if (parsed.source === 'facebook' && parsed.embedUrl) {
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
        <iframe
          src={`${parsed.embedUrl}&show_text=false`}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // Direct video file
  if (parsed.source === 'direct') {
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden bg-black", className)}>
        <video
          src={url}
          title={title}
          controls={showControls}
          autoPlay={autoPlay}
          className="w-full h-full"
          onError={() => setHasError(true)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // LinkedIn, Twitter, and other sources - show link to open externally
  return (
    <div className={cn(
      "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center",
      className
    )}>
      <div className="text-center">
        <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">{getVideoSourceName(parsed.source)} Video</p>
        <p className="text-xs text-muted-foreground mb-3">
          This video must be viewed on {getVideoSourceName(parsed.source)}
        </p>
        <a
          href={parsed.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Watch on {getVideoSourceName(parsed.source)}
        </a>
      </div>
    </div>
  )
})

export default VideoPlayer
