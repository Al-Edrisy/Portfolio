"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight, Sparkles, Terminal, ShieldCheck, Compass } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PracticeHeroProps {
  yearsOfExperience: number
}

export default function PracticeHero({ yearsOfExperience }: PracticeHeroProps) {
  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 border-b border-border/40 overflow-hidden">
      {/* Subtle architectural ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        {/* Practice Label & Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs font-mono tracking-tight text-muted-foreground backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>THE PRACTICE // SALIH BEN OTMAN (AL-EDRISY)</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>B.SC. SOFTWARE ENGINEERING</span>
            <span className="text-border">•</span>
            <span>FINAL INTERNATIONAL UNIVERSITY</span>
          </div>
        </motion.div>

        {/* Editorial Vision Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.15] mb-8">
            An engineering practice working across full-stack systems, autonomous AI agents, and high-craft software.
          </h1>

          <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-normal leading-relaxed max-w-3xl">
            Operating at the intersection of classical software engineering and modern AI orchestration. 
            The practice partners with founders, engineering teams, and ambitious ventures to shape how 
            their products think, scale, and feel—from low-latency backend architectures to tactile digital experiences.
          </p>
        </motion.div>

        {/* Practice Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-12 mt-12 border-t border-border/40"
        >
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground font-mono">
              {yearsOfExperience}+
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Years Engineering Craft
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground font-mono">
              50+
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Shipped Systems & Apps
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground font-mono">
              FIU
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Software Engineering B.Sc.
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground font-mono">
              100%
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Clean Architecture
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
