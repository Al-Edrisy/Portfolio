'use client'

import React, { useState } from 'react'
import { Share2, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { toAbsoluteUrl } from '@/lib/utils/site-url'

export interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
  label?: string
}

export function ShareButton({
  url,
  title = 'Check this out on Salih Ben Otman Portfolio',
  description = 'Explore this project and digital experience.',
  variant = 'outline',
  size = 'default',
  className = '',
  showLabel = true,
  label = 'Share',
}: ShareButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const getShareUrl = (): string => {
    if (typeof window !== 'undefined') {
      if (!url) return window.location.href
      return toAbsoluteUrl(url)
    }
    return toAbsoluteUrl(url || '')
  }

  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const targetUrl = getShareUrl()
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: 'Link Copied!',
          description: 'URL copied to your clipboard ready to share.',
        })
      }
    } catch {
      toast({
        title: 'Copy Failed',
        description: targetUrl,
        variant: 'destructive',
      })
    }
  }

  const handleNativeShare = async (e: React.MouseEvent) => {
    const targetUrl = getShareUrl()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      // If mobile or device supports Web Share API, try native sheet first
      try {
        await navigator.share({
          title,
          text: description,
          url: targetUrl,
        })
        return
      } catch (err: any) {
        // User cancelled or share dismissed; if not an AbortError, let the dropdown handle it
        if (err.name !== 'AbortError') {
          console.log('Web share error:', err)
        }
      }
    }
  }

  const shareToLinkedIn = () => {
    const targetUrl = encodeURIComponent(getShareUrl())
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${targetUrl}`,
      '_blank',
      'noopener,noreferrer,width=600,height=600'
    )
  }

  const shareToFacebook = () => {
    const targetUrl = encodeURIComponent(getShareUrl())
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`,
      '_blank',
      'noopener,noreferrer,width=600,height=600'
    )
  }

  const shareToTwitter = () => {
    const targetUrl = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(`${title}\n`)
    window.open(
      `https://twitter.com/intent/tweet?url=${targetUrl}&text=${text}`,
      '_blank',
      'noopener,noreferrer,width=600,height=500'
    )
  }

  const shareToWhatsApp = () => {
    const targetUrl = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(`${title}\n${getShareUrl()}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label="Share this page"
          onClick={(e) => {
            // If on touch mobile device with native share, attempt native share
            if (typeof window !== 'undefined' && window.innerWidth < 640 && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
              handleNativeShare(e)
            }
          }}
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          {showLabel && <span>{label}</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="font-medium text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono">URL</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.27 1.64 1.64 0 0 0 0 3.27m1.4 9.74V9.93H5.06v8.57h2.8z" />
            </svg>
            <span className="text-xs font-medium">LinkedIn</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current text-foreground" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-xs font-medium">X (Twitter)</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
              <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
            </svg>
            <span className="text-xs font-medium">Facebook</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.212 8.212 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.22.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.18-.48-.3z" />
            </svg>
            <span className="text-xs font-medium">WhatsApp</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
