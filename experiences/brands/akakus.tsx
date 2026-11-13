'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { BrandShell } from '@/experiences/shared/brand-shell'
import { getBrandMediaUrl, getBrandCloudflareUrl } from '@/experiences/shared/media-utils'
import { Button } from '@/components/ui/button'

/**
 * Lightweight GPU WebGL fragment shader rendering subtle, pointer-reactive
 * warm sandstone light caustics over the #F9F5E4 canvas.
 * Respects prefers-reduced-motion and degrades gracefully to solid #F9F5E4.
 */
function AkakusWebGLField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl) return

    const vertexSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    const fragmentSrc = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec2 u_res;

      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_res.x / max(u_res.y, 1.0), 1.0);
        float d = distance(uv * aspect, u_mouse * aspect);

        // Base #F9F5E4 -> rgb(0.9765, 0.9608, 0.8941)
        vec3 base = vec3(0.9765, 0.9608, 0.8941);
        // Subtle warm terracotta & sunlit dune drift
        float wave = sin(uv.x * 3.1 + u_time * 0.25) * cos(uv.y * 2.4 - u_time * 0.18);
        vec3 warmGlow = vec3(0.996, 0.945, 0.865);
        float pointerHalo = exp(-d * 3.2) * 0.35;

        vec3 color = mix(base, warmGlow, clamp(wave * 0.15 + pointerHalo, 0.0, 0.45));
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, vertexSrc)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uRes = gl.getUniformLocation(program, 'u_res')

    let mouseX = 0.5
    let mouseY = 0.5
    let targetX = 0.5
    let targetY = 0.5
    let rafId = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(canvas.clientWidth * dpr)
      canvas.height = Math.floor(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetX = (e.clientX - rect.left) / Math.max(rect.width, 1)
      targetY = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })

    const start = performance.now()
    const render = (now: number) => {
      mouseX += (targetX - mouseX) * 0.06
      mouseY += (targetY - mouseY) * 0.06
      gl.uniform1f(uTime, (now - start) * 0.001)
      gl.uniform2f(uMouse, mouseX, mouseY)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}

const EXPERIENCE_CHAPTERS = [
  {
    id: 'splash',
    label: 'Splash & Audio Coach',
    title: 'First impressions with physical presence',
    copy: 'Instead of sterile loading spinners, the Akakus wordmark acts as an architectural stage. Coach Fuzzy laces up in blue sweatbands, peeks from the bottom bezel, or drops in from the Dynamic Island to cue the Audio Coach.',
    image: 'splash-trio.webp',
    alt: 'Three Akakus mobile splash screens on obsidian background showing Fuzzy coaching, peeking, and introducing Audio Coach',
  },
  {
    id: 'in-app',
    label: 'Interactive Worlds',
    title: 'Active living as a playable space',
    copy: 'Daily telemetry—heart rate, energy, and milestones—lives quietly at the top of the viewport while conversational modes like Dream Home, Epic Bikes, and Creative Mode turn habit tracking into an inviting world.',
    image: 'in-app-trio.webp',
    alt: 'Three Akakus in-app screens showing status rings, interactive topic pills, and Dream Home progress view',
  },
] as const

export default function AkakusBrandExperience() {
  const [activeStage, setActiveStage] = useState<'splash' | 'in-app'>('splash')

  return (
    <BrandShell
      brandName="Akakus"
      tagline="Your ultimate partner in active living"
      accentColor="#D94E28"
      backHref="/projects"
      backLabel="Portfolio"
      className="bg-[#F9F5E4] text-[#1C1B19] selection:bg-[#D94E28] selection:text-[#F9F5E4] antialiased"
      style={{
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      }}
    >
      {/* =========================================================
          1. ARTIFACT-LED HERO ON #F9F5E4 WITH WEBGL FIELD
         ========================================================= */}
      <section className="relative overflow-hidden bg-[#F9F5E4] pt-24 pb-16 md:pt-28 md:pb-24">
        <AkakusWebGLField />

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-2xl"
            style={{
              WebkitMaskImage:
                'radial-gradient(ellipse 96% 92% at 50% 50%, #000 78%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 96% 92% at 50% 50%, #000 78%, transparent 100%)',
            }}
          >
            <Image
              src={getBrandMediaUrl('akakus', 'hero-wordmark.webp')}
              alt="Akakus — Your ultimate partner in active living, featuring Fuzzy characters climbing across the wordmark"
              width={1024}
              height={571}
              priority
              loading="eager"
              decoding="sync"
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Editorial Intro & Metadata Strip */}
          <div className="mt-14 grid grid-cols-1 gap-10 border-t border-[#1C1B19]/12 pt-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1
                className="text-3xl font-semibold text-[#1C1B19] sm:text-4xl lg:text-[2.75rem]"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.12, textWrap: 'balance' }}
              >
                A living companion for nutrition, movement, and everyday energy.
              </h1>
              <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-[#4E4A3F] sm:text-lg">
                Akakus pairs AI-assisted meal and activity awareness with a tactile 3D character
                world. Rather than confronting people with harsh charts or clinical numbers, the
                identity treats the mobile screen as a real place where Fuzzy climbs the
                typography, coaches workouts, and celebrates quiet consistency.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start text-sm lg:col-span-5">
              <div>
                <dt className="text-xs font-medium text-[#6B6556]">Product</dt>
                <dd className="mt-1 font-medium text-[#1C1B19]">Akakus</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6B6556]">Discipline</dt>
                <dd className="mt-1 font-medium text-[#1C1B19]">Brand, 3D Character, Mobile UI</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6B6556]">Platform</dt>
                <dd className="mt-1 font-medium text-[#1C1B19]">iOS &amp; Android (Expo)</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6B6556]">Year</dt>
                <dd className="mt-1 font-medium tabular-nums text-[#1C1B19]">2026</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. CHARACTER DIMENSION & ICONOGRAPHY PRESENCE (#F9F5E4)
         ========================================================= */}
      <section className="bg-[#F9F5E4] py-16 md:py-24">
        <div className="mx-auto max-w-6xl space-y-24 px-5 sm:px-8">
          {/* Spread A: Character Presence */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2
                className="text-2xl font-semibold text-[#1C1B19] sm:text-3xl"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.15, textWrap: 'balance' }}
              >
                Warmth you can feel before reading a single metric
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#4E4A3F]">
                Fuzzy’s plush silhouette, terracotta coat, and luminous crown tips bring physical
                weight to an otherwise abstract health tracker. A slate geometric bandana grounds
                the character in desert craft while keeping the expression unmistakable at any
                scale.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 92% 90% at 50% 50%, #000 72%, transparent 100%)',
                  maskImage:
                    'radial-gradient(ellipse 92% 90% at 50% 50%, #000 72%, transparent 100%)',
                }}
              >
                <Image
                  src={getBrandMediaUrl('akakus', 'companion-wave.webp')}
                  alt="Full-body 3D render of Fuzzy waving with glowing head tips and a geometric slate bandana"
                  width={1024}
                  height={571}
                  loading="eager"
                  decoding="async"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Spread B: App Icon */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 94% 92% at 50% 50%, #000 76%, transparent 100%)',
                  maskImage:
                    'radial-gradient(ellipse 94% 92% at 50% 50%, #000 76%, transparent 100%)',
                }}
              >
                <Image
                  src={getBrandMediaUrl('akakus', 'app-icon.webp')}
                  alt="Akakus iOS app icon featuring Fuzzy waving on a warm cream squircle tile"
                  width={1024}
                  height={571}
                  loading="eager"
                  decoding="async"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-5">
              <h2
                className="text-2xl font-semibold text-[#1C1B19] sm:text-3xl"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.15, textWrap: 'balance' }}
              >
                An icon that greets you on the home screen
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#4E4A3F]">
                Sitting beside pastel system utilities, the Akakus squircle avoids sterile graphs
                or checkmarks. Fuzzy’s wave turns the daily act of opening the app into a friendly
                check-in rather than a chore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. OBSIDIAN PRODUCT STAGE (#000000)
          Seamless integration of Launch Film, mobile trios & icons
         ========================================================= */}
      <section className="bg-[#000000] py-20 text-[#F9F5E4] md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Cloudflare R2 Launch Film */}
          <div className="mb-20">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2
                  className="text-3xl font-semibold text-[#F9F5E4] sm:text-4xl"
                  style={{ letterSpacing: '-0.025em', lineHeight: 1.12, textWrap: 'balance' }}
                >
                  Launch Film
                </h2>
                <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-[#C8C2B0]">
                  Introducing Fuzzy and the Akakus active living companion in motion.
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#8F8A7B]">
                1080p · 24fps · Cloudflare R2 Stream
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#0A0A09] ring-1 ring-[#F9F5E4]/10">
              <video
                src={getBrandCloudflareUrl('akakus', 'launch_1080p.mp4')}
                poster={getBrandMediaUrl('akakus', 'hero-wordmark.webp')}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border-b border-[#F9F5E4]/15 pb-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2
                className="text-3xl font-semibold text-[#F9F5E4] sm:text-4xl"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.12, textWrap: 'balance' }}
              >
                Inside the mobile experience
              </h2>
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[#C8C2B0]">
                Warm cream interfaces framed inside sleek hardware bezels—switching cleanly between
                splash storytelling, Audio Coach prompts, and interactive daily chapters.
              </p>
            </div>

            {/* Clean pill switcher */}
            <div
              role="tablist"
              aria-label="Mobile experience chapters"
              className="inline-flex rounded-full bg-[#161513] p-1"
            >
              {EXPERIENCE_CHAPTERS.map(ch => {
                const active = activeStage === ch.id
                return (
                  <button
                    key={ch.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveStage(ch.id)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94E28] ${
                      active
                        ? 'bg-[#F9F5E4] text-[#1C1B19]'
                        : 'text-[#C8C2B0] hover:text-[#F9F5E4]'
                    }`}
                  >
                    {ch.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Stage Switcher + Full Trio Display */}
          <div className="mt-12 space-y-16">
            {EXPERIENCE_CHAPTERS.map(ch => {
              const isSelected = activeStage === ch.id
              return (
                <div
                  key={ch.id}
                  className={`transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-45 hover:opacity-80'
                  }`}
                  onClick={() => setActiveStage(ch.id)}
                >
                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-baseline">
                    <h3
                      className="text-xl font-medium text-[#F9F5E4] md:col-span-5"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {ch.title}
                    </h3>
                    <p className="max-w-[65ch] text-sm leading-relaxed text-[#C8C2B0] md:col-span-7">
                      {ch.copy}
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-xl bg-[#000000]">
                    <Image
                      src={getBrandMediaUrl('akakus', ch.image)}
                      alt={ch.alt}
                      width={1024}
                      height={571}
                      loading="eager"
                      decoding="async"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Custom Iconography Sheet */}
          <div className="mt-24 grid grid-cols-1 items-center gap-10 border-t border-[#F9F5E4]/15 pt-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3
                className="text-2xl font-semibold text-[#F9F5E4] sm:text-3xl"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
              >
                Bespoke stroke &amp; solid iconography
              </h3>
              <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#C8C2B0]">
                Every action inside Akakus—wellness hearts, energy bolts, milestones, media
                capture, and mood cues—is drawn with rounded terminals and uniform visual weight to
                match the softness of Fuzzy and the heavy wordmark.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="mx-auto max-w-lg overflow-hidden bg-[#000000]">
                <Image
                  src={getBrandMediaUrl('akakus', 'iconography-sheet.webp')}
                  alt="Akakus custom icon family showing smiley mark, hearts, lightning bolt, diamond, bag, share, refresh, and gallery icons"
                  width={1024}
                  height={893}
                  loading="eager"
                  decoding="async"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. CLOSING SIGNATURE & NAVIGATION (#F9F5E4)
         ========================================================= */}
      <footer className="bg-[#F9F5E4] pt-20 pb-20 text-[#1C1B19]">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <div
            className="mx-auto max-w-3xl overflow-hidden rounded-2xl"
            style={{
              WebkitMaskImage:
                'radial-gradient(ellipse 94% 92% at 50% 50%, #000 76%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 94% 92% at 50% 50%, #000 76%, transparent 100%)',
            }}
          >
            <Image
              src={getBrandMediaUrl('akakus', 'adventure-footer.webp')}
              alt="an AKAKUS adventure wordmark framed inside the lower bezel of an iPhone on #F9F5E4"
              width={1024}
              height={571}
              loading="eager"
              decoding="async"
              className="h-auto w-full object-contain"
            />
          </div>

          <p className="mx-auto mt-8 max-w-[55ch] text-base leading-relaxed text-[#4E4A3F]">
            Built with React Native, Expo, and Gemini Vision—designed to feel effortless from the
            first tap.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="rounded-full bg-[#1C1B19] px-6 py-2.5 text-sm font-medium text-[#F9F5E4] hover:bg-[#33312D]"
            >
              <Link href="/projects">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#1C1B19]/20 bg-transparent px-6 py-2.5 text-sm font-medium text-[#1C1B19] hover:bg-[#1C1B19]/5"
            >
              <Link href="/experiences">
                All Brand Experiences
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </BrandShell>
  )
}
