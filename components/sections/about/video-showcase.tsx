"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { Maximize2, Pause, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { video } from "@/constants/profile"
import { Reveal } from "./reveal"
import { SectionShell } from "./section-shell"

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const minutes = Math.floor(safe / 60)
  const rest = Math.floor(safe % 60)
  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

/**
 * Why this player looks the way it does:
 * - The source recording is a WebM with an alpha channel (transparent background). It was
 *   composited onto solid white at encode time, so the stage is white too and the edges
 *   disappear instead of rendering as dark smears.
 * - Controls sit BELOW the picture, never on top of it, so they cannot hide the tool UI
 *   and are always reachable on touch screens (no hover dependency).
 * - Plays only while on screen, never for users who prefer reduced motion.
 */
export default function VideoShowcase() {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const userPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState<number>(video.durationSeconds)

  useEffect(() => {
    const stage = stageRef.current
    const el = videoRef.current
    if (!stage || !el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused.current && !reduceMotion) void el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(stage)
    return () => observer.disconnect()
  }, [reduceMotion])

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      userPaused.current = false
      void el.play().catch(() => {})
    } else {
      userPaused.current = true
      el.pause()
    }
  }

  const seek = (value: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = value
    setTime(value)
  }

  const toggleFullscreen = () => {
    const stage = stageRef.current
    const el = videoRef.current as FullscreenVideo | null
    if (!stage || !el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else if (stage.requestFullscreen) {
      void stage.requestFullscreen().catch(() => {})
    } else {
      // iPhone Safari only supports fullscreen on the <video> itself.
      el.webkitEnterFullscreen?.()
    }
  }

  return (
    <SectionShell
      id="tooling"
      eyebrow="Tooling"
      title="Tools that make exploration tangible."
      description="Building small tools and using AI to remove friction gives teams something real to react to from day one, instead of another round of slides."
    >
      <Reveal>
        <figure className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div
            ref={stageRef}
            className="relative aspect-video w-full bg-white [&:fullscreen]:aspect-auto [&:fullscreen]:h-screen"
          >
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster={video.poster}
              aria-label={video.title}
              aria-describedby="tooling-caption"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onClick={togglePlay}
              className="size-full cursor-pointer bg-white object-contain"
            >
              {/* Cloudflare R2 first, same-origin static copy as fallback. */}
              <source src={video.src} type="video/mp4" />
              <source src={video.fallbackSrc} type="video/mp4" />
            </video>

            {!playing && (
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={togglePlay}
                className="absolute inset-0 grid place-items-center bg-transparent"
              >
                <span className="grid size-16 place-items-center rounded-full bg-foreground text-background shadow-lg transition-transform duration-200 ease-out active:scale-95 sm:size-20">
                  <Play className="size-7 translate-x-0.5 fill-current sm:size-8" />
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border/60 px-2 py-1 sm:gap-3 sm:px-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="size-11 shrink-0"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>

            <input
              type="range"
              min={0}
              max={duration || video.durationSeconds}
              step={0.01}
              value={Math.min(time, duration || video.durationSeconds)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Seek video"
              aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
              className="h-11 min-w-0 flex-1 cursor-pointer accent-foreground"
            />

            <span className="hidden shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:inline">
              {formatTime(time)} / {formatTime(duration)}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="size-11 shrink-0"
            >
              <Maximize2 className="size-4" />
            </Button>
          </div>

          <figcaption
            id="tooling-caption"
            className="flex flex-col gap-3 border-t border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <span className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">{video.title}.</strong>{" "}
              {video.description}
            </span>
            <span className="flex shrink-0 flex-wrap gap-2">
              <Badge variant="outline" className="font-mono text-[11px]">
                3D wireframes
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Generative scenes
              </Badge>
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </SectionShell>
  )
}
