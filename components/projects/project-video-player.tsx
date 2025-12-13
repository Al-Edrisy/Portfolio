"use client"

import { memo } from 'react'
import { parseVideoUrl } from '@/lib/utils/video-helpers'
import { Card } from '@/components/ui/card'
import { Video } from 'lucide-react'

interface ProjectVideoPlayerProps {
    videoUrl: string
    title?: string
}

export const ProjectVideoPlayer = memo(function ProjectVideoPlayer({
    videoUrl,
    title
}: ProjectVideoPlayerProps) {
    const parsed = parseVideoUrl(videoUrl)

    if (!parsed.isValid || !parsed.embedUrl) return null

    const renderPlayer = () => {
        switch (parsed.source) {
            case 'direct':
                return (
                    <video
                        controls
                        className="w-full h-full rounded-lg"
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
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )

            case 'linkedin':
                // LinkedIn embeds can be tricky, often they are just the post URL if it's not a direct video
                // But if parseVideoUrl returns an embedUrl for it, we try to use it.
                // If it's a direct mp4 from linkedin, it falls into 'direct' usually or handled custom
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
                    <iframe
                        src={parsed.embedUrl!}
                        title={title || "LinkedIn Video"}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                    />
                )

            default:
                return (
                    <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground rounded-lg">
                        <div className="text-center p-4">
                            <Video className="w-8 h-8 mx-auto mb-2" />
                            <p>Content cannot be embedded directly.</p>
                            <a
                                href={parsed.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                            >
                                View on {parsed.source}
                            </a>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="w-full space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Video Demonstration
            </h3>
            <div className="relative w-full aspect-video bg-black/5 rounded-xl border overflow-hidden shadow-sm">
                {renderPlayer()}
            </div>
        </div>
    )
})
