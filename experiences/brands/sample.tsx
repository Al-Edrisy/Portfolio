'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  ArrowRight,
  Layers,
  Zap,
  ShieldCheck,
  Smartphone,
  Palette,
  CheckCircle2,
  Terminal,
  Cpu,
  Globe2,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { BrandShell } from '@/experiences/shared/brand-shell'
import { useBrandGsap } from '@/experiences/shared/use-brand-gsap'
import { getBrandMediaUrl } from '@/experiences/shared/media-utils'
import { Button } from '@/components/ui/button'

/**
 * ==============================================================================
 * SAMPLE BRAND EXPERIENCE TEMPLATE (Open-Canvas Blueprint)
 * ==============================================================================
 * This file serves as the canonical reference for creating custom brand experiences.
 * Because every project has unique requirements, you can write literally ANY React JSX
 * inside this file—from 3D canvases to interactive app simulations.
 *
 * To create a new brand (e.g. 'pronto' or 'seven-a'):
 * 1. Duplicate this file as `experiences/brands/pronto.tsx`
 * 2. Customize the components, copy, colors, and interactive widgets.
 * 3. It will immediately be live at `/experiences/pronto`!
 */

export default function SampleBrandExperience() {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'architecture'>('overview')
  const [interactiveCounter, setInteractiveCounter] = useState(1)

  // Example: GSAP ScrollTrigger animation with auto-cleanup
  const containerRef = useBrandGsap((ctx, el) => {
    // Subtle GSAP scroll reveal for metrics
    ctx.add('revealMetrics', () => {
      // Custom GSAP timeline or triggers can be added here
    })
  })

  // Cloudflare R2 media resolver example
  const sampleVideoUrl = getBrandMediaUrl('sample', 'showcase-preview.mp4')

  return (
    <BrandShell
      brandName="Aura Design Systems"
      accentColor="#3B82F6"
      tagline="Next-Generation Spatial Interface & Design Architecture"
      backHref="/experiences"
      backLabel="All Experiences"
    >
      <div ref={containerRef} className="w-full bg-[#090A0F] text-slate-100 min-h-screen">
        
        {/* ==================================================================== */}
        {/* SECTION 1: CINEMATIC HERO                                            */}
        {/* ==================================================================== */}
        <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-6 pt-24 pb-16 overflow-hidden">
          {/* Ambient Radial Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open-Canvas Brand Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-balance leading-[1.08]"
            >
              Spatial Interface. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                Engineered for Fluidity.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto text-balance font-normal"
            >
              A high-velocity design architecture built on sub-millisecond tactile responsiveness,
              adaptive typography, and Cloudflare-accelerated streaming media.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <a href="#showcase">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-7 shadow-lg shadow-blue-500/20">
                  <span>Explore Interactive Mockup</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="#architecture">
                <Button size="lg" variant="outline" className="border-slate-800 hover:bg-slate-900/60 rounded-full text-slate-300">
                  <span>Technical Specs</span>
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: BRAND PHILOSOPHY & STORY                                  */}
        {/* ==================================================================== */}
        <section className="py-24 px-6 border-t border-slate-900/80 bg-slate-950/40">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Design Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-snug">
                Eliminating interface lag through mathematical physics.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Traditional digital products suffer from disconnected transitions and rigid box-model
                layouts. This brand experience explores a continuous physics model where every touch gesture
                hands off velocity naturally into springs without sudden stops.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-2xl font-bold text-blue-400">0.01ms</div>
                  <div className="text-xs text-slate-500 mt-1">Reduced Motion Clamping</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-2xl font-bold text-teal-400">120 FPS</div>
                  <div className="text-xs text-slate-500 mt-1">Hardware Composite RAF</div>
                </div>
              </div>
            </div>

            {/* Visual Quote Card */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <blockquote className="text-lg text-slate-300 font-serif italic mb-6 leading-relaxed">
                "When software feels tactile and immediate, the user forgets the glass and connects directly with the intention."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Aura Creative Labs</div>
                  <div className="text-xs text-slate-500">Design Engineering Division</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: INTERACTIVE PRODUCT SHOWCASE (LIVE DEMO)                   */}
        {/* ==================================================================== */}
        <section id="showcase" className="py-24 px-6 border-t border-slate-900/80">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Interactive Canvas
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Experience the live component in action.
              </h2>
              <p className="text-slate-400 text-sm">
                This interactive widget demonstrates how bespoke JSX components can include rich state,
                gesture taps, and live feedback directly inside the experience.
              </p>
            </div>

            {/* Interactive Mockup Container */}
            <div className="p-6 sm:p-10 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
              {/* Tab Selector */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {(['overview', 'features', 'architecture'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Dynamic Tab Content */}
              <div className="min-h-[260px] flex flex-col justify-center items-center text-center p-6 rounded-xl bg-slate-900/40 border border-slate-800/50">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 max-w-md"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">Fluid Dispatch Telemetry</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Simulating live order routing and driver trajectory at 60 updates per second with zero UI frame drops.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          onClick={() => setInteractiveCounter((c) => c + 1)}
                          className="bg-blue-600 hover:bg-blue-500 text-xs rounded-full px-4"
                        >
                          Trigger Simulated Event ({interactiveCounter})
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'features' && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3 max-w-md text-left"
                    >
                      {[
                        'Sub-millisecond touch event ingestion',
                        'Decoupled WebGL shader particle layer',
                        'Automatic Cloudflare edge image compression',
                        'Non-destructive reduced motion fallback'
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'architecture' && (
                    <motion.div
                      key="architecture"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3 max-w-lg font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 text-left"
                    >
                      <div className="text-blue-400">// Cloudflare R2 Streaming Architecture</div>
                      <div>GET /api/media/sample/showcase-preview.mp4</div>
                      <div className="text-teal-400">&gt; HTTP/2 206 Partial Content</div>
                      <div className="text-slate-500">&gt; Content-Range: bytes 0-1048575/8429104</div>
                      <div className="text-slate-500">&gt; Cache-Control: public, max-age=31536000, immutable</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: VISUAL IDENTITY & TOKENS                                  */}
        {/* ==================================================================== */}
        <section className="py-24 px-6 border-t border-slate-900/80 bg-slate-950/40">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Visual Identity
              </span>
              <h2 className="text-3xl font-bold tracking-tight">Design System Palette</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Electric Azure', hex: '#3B82F6', role: 'Primary Accent' },
                { name: 'Obsidian Void', hex: '#090A0F', role: 'Canvas Surface' },
                { name: 'Teal Flare', hex: '#14B8A6', role: 'Secondary Signal' },
                { name: 'Slate Whisper', hex: '#94A3B8', role: 'Typography Muted' },
              ].map((swatch, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div
                    className="w-full h-16 rounded-lg shadow-inner"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div>
                    <div className="text-sm font-semibold">{swatch.name}</div>
                    <div className="text-xs font-mono text-slate-400">{swatch.hex}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{swatch.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 5: TECHNICAL ENGINEERING SPECIFICATIONS                      */}
        {/* ==================================================================== */}
        <section id="architecture" className="py-24 px-6 border-t border-slate-900/80">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Engineering Stack
              </span>
              <h2 className="text-3xl font-bold tracking-tight">Technical Architecture</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Cpu className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold text-lg">Next.js 15 & React 19</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Server Components generate pristine initial HTML for search engines and direct links,
                  hydrating only the interactive widgets on client runtime.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Globe2 className="w-6 h-6 text-teal-400" />
                <h3 className="font-semibold text-lg">Cloudflare R2 & CDN</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Heavy media assets and high-frame-rate videos are offloaded to Cloudflare R2 bucket with
                  edge caching and range-request video streaming.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Zap className="w-6 h-6 text-indigo-400" />
                <h3 className="font-semibold text-lg">GSAP 3 Lifecycle</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All scroll triggers, pin spacers, and tweens run inside self-cleaning contexts,
                  guaranteeing zero DOM pollution or memory leaks upon exiting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 6: CLOSING EXPERIENCE & RETURN TO PORTFOLIO                  */}
        {/* ==================================================================== */}
        <section className="py-24 px-6 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-black text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to craft your next brand experience?
            </h2>

            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Duplicate this sample file to <code>experiences/brands/your-brand.tsx</code> and create your own
              bespoke digital showcase in minutes.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/experiences">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                  <span>Explore All Experiences</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="border-slate-800 hover:bg-slate-900 rounded-full text-slate-300">
                  <span>Return to Portfolio</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </BrandShell>
  )
}
