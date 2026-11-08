"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Sliders } from "lucide-react"

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isLooping, setIsLooping] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Autoplay management
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  // Toggle playback
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err)
      })
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err)
      })
    }
  }

  // Update progress bar
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || 1
    setProgress((current / total) * 100)
  }

  return (
    <section className="py-16 md:py-24 border-b border-border/40 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Technology & Bespoke Tooling</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Building proprietary tools to accelerate exploration.
            </h2>
          </div>

          <p className="text-sm md:text-base text-muted-foreground max-w-md font-normal leading-relaxed">
            The practice designs its own internal tools and leverages AI to eliminate workflow friction, 
            giving founding teams something tangible to explore from day one.
          </p>
        </div>

        {/* Video Canvas Container - Crisp frame with clean dark border and zero blurry ambient halos */}
        <motion.div
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl"
        >
          {/* Video Player Frame with 16:9 Aspect Ratio */}
          <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={isLooping}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            >
              <source src="/api/media/videos/generative-lab-exploration.mp4" type="video/mp4" />
              <source src="/videos/generative-lab-exploration.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>

            {/* Top Status Bar: Crisp floating pills that reveal smoothly on hover or pause */}
            <div className={`absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 flex items-center justify-between gap-2 pointer-events-none z-20 transition-opacity duration-300 ${isHovered || !isPlaying ? "opacity-100" : "opacity-80 sm:opacity-0"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-mono text-zinc-200 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-medium">01 // PARAMETRIC MESH & GENERATIVE SCENE ENGINE</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-mono text-zinc-300 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                <span>R2 CLOUDFLARE HOSTED</span>
                <span className="text-zinc-600">•</span>
                <span>CRISP 1080P</span>
              </div>
            </div>

            {/* Big Play Button Overlay on Pause */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer z-10 transition-all"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-2xl transform transition-transform hover:scale-105 active:scale-95">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Bottom Controls Bar: Clean auto-hiding glassbar */}
            <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-5 z-20 flex flex-col gap-2.5 transition-opacity duration-300 ${isHovered || !isPlaying ? "opacity-100" : "opacity-90 sm:opacity-0"}`}>
              {/* Scrub Progress Track */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Action Row */}
              <div className="flex items-center justify-between text-white text-xs sm:text-sm font-mono">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    aria-label="Toggle loop"
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isLooping ? "text-primary bg-white/10" : "text-white/60 hover:bg-white/10"}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300 text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-md bg-white/10 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>INTERNAL LAB EXPLORATION</span>
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    aria-label="Fullscreen"
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Caption & Storytelling Annotation: Clean aligned layout */}
        <div className="mt-5 sm:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 text-xs font-mono text-muted-foreground border-t border-border/30 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="leading-snug">
              Interactive Tooling: 3D Surface Distortion, Vector Lattice, & Generative Scene Matrix
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/50">Client & Internal Explorations</span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/50">TypeScript + WebGL/Canvas + UI Primitives</span>
          </div>
        </div>
      </div>
    </section>
  )
}
