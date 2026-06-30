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
                    <div className="flex items-center justify-center w-full h-full bg-[#0A66C2]/5 rounded-lg">
                        <div className="text-center p-6">
                            <svg className="w-12 h-12 mx-auto mb-3 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <p className="font-semibold text-foreground mb-1">{title || 'LinkedIn Video'}</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                LinkedIn videos cannot be embedded due to platform security restrictions.
                            </p>
                            <a
                                href={parsed.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white text-sm font-medium rounded-lg hover:bg-[#004182] transition-colors"
                            >
                                Watch on LinkedIn ↗
                            </a>
                        </div>
                    </div>
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
