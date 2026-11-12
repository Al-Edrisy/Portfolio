'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Compass, Volume2, VolumeX } from 'lucide-react'

export interface BrandShellProps {
  brandName: string
  accentColor?: string
  tagline?: string
  backHref?: string
  backLabel?: string
  soundUrl?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function BrandShell({
  brandName,
  accentColor = '#FF4757',
  tagline,
  backHref = '/projects',
  backLabel = 'Portfolio',
  soundUrl,
  children,
  className = '',
  style,
}: BrandShellProps) {
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const toggleSound = () => {
    if (!audioRef.current && soundUrl) {
      audioRef.current = new Audio(soundUrl)
      audioRef.current.loop = true
    }

    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {})
        setIsMuted(false)
      } else {
        audioRef.current.pause()
        setIsMuted(true)
      }
    }
  }

  return (
    <div
      className={`brand-scope relative min-h-screen text-foreground overflow-x-hidden ${className}`}
      style={{
        ...style,
        ['--brand-accent' as any]: accentColor,
      }}
    >
      {/* Floating Top Navigation */}
      <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none max-w-7xl mx-auto">
        {/* Left: Back Navigation links */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-xs font-medium hover:border-primary/50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{backLabel}</span>
          </Link>

          <Link
            href="/experiences"
            className="group hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-xs font-medium hover:border-primary/50 transition-all shadow-sm text-muted-foreground hover:text-foreground"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>All Experiences</span>
          </Link>
        </div>

        {/* Right: Brand Badge & Audio toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {soundUrl && (
            <button
              onClick={toggleSound}
              type="button"
              className="p-2 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-xs font-medium hover:border-primary/50 transition-all shadow-sm text-muted-foreground hover:text-foreground"
              title={isMuted ? 'Play ambient sound' : 'Mute sound'}
              aria-label={isMuted ? 'Play ambient sound' : 'Mute sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-sm">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span>{brandName}</span>
          </div>
        </div>
      </header>

      {/* Main Experience Canvas */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
