/**
 * Video helper utilities for parsing and embedding videos from multiple sources
 * Supports: YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, and direct video URLs
 */

export type VideoSource = 
  | 'youtube' 
  | 'vimeo' 
  | 'linkedin' 
  | 'facebook' 
  | 'twitter' 
  | 'direct' 
  | 'unknown'

export interface ParsedVideo {
  source: VideoSource
  videoId: string | null
  embedUrl: string | null
  thumbnailUrl: string | null
  originalUrl: string
  isValid: boolean
}

/**
 * Parse a video URL and extract source, video ID, and embed URL
 */
export function parseVideoUrl(url: string): ParsedVideo {
  if (!url || typeof url !== 'string') {
    return {
      source: 'unknown',
      videoId: null,
      embedUrl: null,
      thumbnailUrl: null,
      originalUrl: url || '',
      isValid: false
    }
  }

  const trimmedUrl = url.trim()

  // YouTube
  const youtubeMatch = trimmedUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return {
      source: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Vimeo
  const vimeoMatch = trimmedUrl.match(
    /(?:vimeo\.com\/)(\d+)/
  )
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return {
      source: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnailUrl: null, // Vimeo requires API call for thumbnail
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // LinkedIn Video
  const linkedinMatch = trimmedUrl.match(
    /linkedin\.com\/(?:posts|feed|embed)\/[^/]+(?:\/|-)(\d+)|linkedin\.com\/video\/embed\/(\d+)/
  )
  if (linkedinMatch || trimmedUrl.includes('linkedin.com')) {
    return {
      source: 'linkedin',
      videoId: linkedinMatch?.[1] || linkedinMatch?.[2] || null,
      embedUrl: trimmedUrl, // LinkedIn embeds use the original URL
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Facebook Video
  const facebookMatch = trimmedUrl.match(
    /facebook\.com\/(?:watch\/?\?v=|.*\/videos\/)(\d+)/
  )
  if (facebookMatch || trimmedUrl.includes('facebook.com/watch') || trimmedUrl.includes('fb.watch')) {
    const videoId = facebookMatch?.[1] || null
    return {
      source: 'facebook',
      videoId,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmedUrl)}`,
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Twitter/X Video
  const twitterMatch = trimmedUrl.match(
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
  )
  if (twitterMatch) {
    const videoId = twitterMatch[1]
    return {
      source: 'twitter',
      videoId,
      embedUrl: trimmedUrl, // Twitter embeds require their widget
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Direct video file (mp4, webm, ogg, mov) - check file extension
  const directVideoMatch = trimmedUrl.match(
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i
  )
  if (directVideoMatch) {
    return {
      source: 'direct',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // LinkedIn CDN video URLs (dms.licdn.com with /mp4- or /playlist/vid/)
  if (trimmedUrl.includes('licdn.com') && 
      (trimmedUrl.includes('/mp4-') || trimmedUrl.includes('/playlist/vid/'))) {
    return {
      source: 'linkedin',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Generic video URL patterns (URLs containing video format indicators)
  const genericVideoMatch = trimmedUrl.match(
    /[/-](mp4|webm|video)[/-]/i
  )
  if (genericVideoMatch) {
    return {
      source: 'direct',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
      originalUrl: trimmedUrl,
      isValid: true
    }
  }

  // Unknown source
  return {
    source: 'unknown',
    videoId: null,
    embedUrl: null,
    thumbnailUrl: null,
    originalUrl: trimmedUrl,
    isValid: false
  }
}

/**
 * Check if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url).isValid
}

/**
 * Get the video source name for display
 */
export function getVideoSourceName(source: VideoSource): string {
  const names: Record<VideoSource, string> = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter/X',
    direct: 'Video File',
    unknown: 'Unknown'
  }
  return names[source]
}

/**
 * Get icon/color for video source
 */
export function getVideoSourceStyle(source: VideoSource): { color: string; bgColor: string } {
  const styles: Record<VideoSource, { color: string; bgColor: string }> = {
    youtube: { color: '#FF0000', bgColor: 'bg-red-500/10' },
    vimeo: { color: '#1AB7EA', bgColor: 'bg-cyan-500/10' },
    linkedin: { color: '#0A66C2', bgColor: 'bg-blue-500/10' },
    facebook: { color: '#1877F2', bgColor: 'bg-blue-600/10' },
    twitter: { color: '#000000', bgColor: 'bg-gray-500/10' },
    direct: { color: '#10B981', bgColor: 'bg-emerald-500/10' },
    unknown: { color: '#6B7280', bgColor: 'bg-gray-500/10' }
  }
  return styles[source]
}
