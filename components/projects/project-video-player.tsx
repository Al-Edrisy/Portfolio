"use client"

import { memo } from 'react'
import { parseVideoUrl } from '@/lib/utils/video-helpers'
import { Video, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectVideoPlayerProps {
  videoUrl: string
  title?: string
  showHeading?: boolean
  className?: string
}

export const ProjectVideoPlayer = memo(function ProjectVideoPlayer({
  videoUrl,
  title,
  showHeading = false,
  className
}: ProjectVideoPlayerProps) {
  const parsed = parseVideoUrl(videoUrl)

  if (!parsed.isValid || !parsed.embedUrl) return null

  const renderPlayer = () => {
    switch (parsed.source) {
      case 'direct':
        return (
          <video
            controls
            className="w-full h-full rounded-lg object-cover"
            poster={parsed.thumbnailUrl || undefined}
            preload="metadata"
          >
            <source src={parsed.embedUrl!} type="video/mp4" />
            <source src={parsed.embedUrl!} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )

      case 'youtube':
      case 'vimeo':
      case 'facebook':
        return (
          <iframe
            src={parsed.embedUrl!}
            title={title || "Video player"}
            className="w-full h-full rounded-lg border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )

      case 'linkedin':
        if (parsed.embedUrl?.includes('/mp4-') || parsed.embedUrl?.includes('/playlist/vid/')) {
          return (
            <video
              controls
              className="w-full h-full rounded-lg"
              preload="metadata"
            >
              <source src={parsed.embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        }
        return (
          <div className="flex items-center justify-center w-full h-full bg-[#0A66C2]/10 rounded-lg p-6">
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">{title || 'LinkedIn Video'}</p>
              <p className="text-xs text-muted-foreground mb-3">
                LinkedIn videos open in the original post.
              </p>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-medium rounded-md hover:bg-[#004182] transition-colors"
              >
                Watch on LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground rounded-lg p-4">
            <div className="text-center">
              <Video className="w-6 h-6 mx-auto mb-1.5" />
              <p className="text-xs mb-2">Content cannot be embedded directly.</p>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs inline-flex items-center gap-1"
              >
                View original video
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {showHeading && (
        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-3">
          <Video className="w-5 h-5 text-primary" />
          Video Demonstration
        </h3>
      )}
      <div className="relative w-full aspect-video bg-muted/30 rounded-lg border border-border/50 overflow-hidden shadow-sm">
        {renderPlayer()}
      </div>
    </div>
  )
})

export const VideoPlayer = ProjectVideoPlayer
export default ProjectVideoPlayer
