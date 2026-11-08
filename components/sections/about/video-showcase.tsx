"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Sparkles, Sliders, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isLooping, setIsLooping] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

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
          <div>
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

        {/* Video Canvas Container with Apple-grade ambient reflection */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative group rounded-2xl md:rounded-3xl border border-border/60 bg-black/90 overflow-hidden shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-sky-500/10 to-indigo-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />

          {/* Video Player Frame */}
          <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={isLooping}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={() => setHasLoaded(true)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            >
              {/* Primary Cloudflare R2 Proxy Stream */}
              <source src="/api/media/videos/generative-lab-exploration.mp4" type="video/mp4" />
              <source src="/api/media/videos/generative-lab-exploration.webm" type="video/webm" />
              {/* Local Public Fallbacks */}
              <source src="/videos/generative-lab-exploration.mp4" type="video/mp4" />
              <source src="/videos/generative-lab-exploration.webm" type="video/webm" />
              Your browser does not support video playback.
            </video>

            {/* Video Overlay Top Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>01 // PARAMETRIC MESH & GENERATIVE SCENE ENGINE</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-400">
                <span>R2 CLOUDFLARE HOSTED</span>
                <span>•</span>
                <span>60 FPS</span>
              </div>
            </div>

            {/* Play/Pause Overlay indicator on hover or pause */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-10 transition-all"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 z-20 flex flex-col gap-3">
              {/* Scrub Line */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Action Row */}
              <div className="flex items-center justify-between text-white/90 text-xs sm:text-sm font-mono">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    aria-label="Toggle loop"
                    className={`p-2 rounded-lg transition-colors ${isLooping ? "text-primary bg-white/10" : "text-white/60 hover:bg-white/10"}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-white/60 text-xs font-mono">
                    INTERNAL LAB EXPLORATION
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    aria-label="Fullscreen"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Caption & Storytelling Annotation */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Interactive Tooling: 3D Surface Distortion, Vector Lattice, & Generative Scene Matrix</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Client & Internal Explorations</span>
            <span className="text-border">•</span>
            <span>TypeScript + WebGL/Canvas + UI Primitives</span>
          </div>
        </div>
      </div>
    </section>
  )
}
