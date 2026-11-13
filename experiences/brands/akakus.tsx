'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Flame,
  Droplets,
  Activity,
  Moon,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Cpu,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Globe2,
} from 'lucide-react'
import { BrandShell } from '@/experiences/shared/brand-shell'
import { useBrandGsap } from '@/experiences/shared/use-brand-gsap'
import { getBrandMediaUrl } from '@/experiences/shared/media-utils'
import { Button } from '@/components/ui/button'

// Biometric States for the Living Companion "Fuzzy"
interface CompanionState {
  id: string
  name: string
  arabicName: string
  image: string
  mood: string
  statusTag: string
  statusColor: string
  metabolicNote: string
  caloriesDelta: string
  macroRatio: string
  description: string
}

const COMPANION_STATES: CompanionState[] = [
  {
    id: 'fuel-up',
    name: 'Fueling Up',
    arabicName: 'تزويد الطاقة',
    image: 'characters/fuel-up.webp',
    mood: 'Nourished & Satiated',
    statusTag: 'Macro Absorbed',
    statusColor: '#C85A32',
    metabolicNote: 'Post-prandial thermogenesis initiated. Calorie intake registered via Gemini Vision.',
    caloriesDelta: '+580 kcal',
    macroRatio: '38% C / 32% P / 30% F',
    description:
      'Fuzzy digests and absorbs nutrients alongside the user. Caloric surplus feeds energy reservoirs and muscle glycogen.',
  },
  {
    id: 'hydration',
    name: 'Optimal Hydration',
    arabicName: 'ترطيب مثالي',
    image: 'characters/hydration.webp',
    mood: 'Replenished & Alert',
    statusTag: 'Fluid Balance 100%',
    statusColor: '#2A9D8F',
    metabolicNote: 'Cellular osmolarity stabilized at 2.4L. Electrolyte retention optimal.',
    caloriesDelta: '0 kcal',
    macroRatio: 'Electrolytes Balanced',
    description:
      'Fluid intake reduces metabolic fatigue and regulates core temperature during desert heat exposure.',
  },
  {
    id: 'workout',
    name: 'Peak Workout',
    arabicName: 'تمرين مكثف',
    image: 'characters/workout.webp',
    mood: 'High Intensity Exertion',
    statusTag: 'Zone 4 Anaerobic',
    statusColor: '#D9534F',
    metabolicNote: 'Heart rate elevated to 164 bpm. Fast-twitch glycogen mobilization in progress.',
    caloriesDelta: '-420 kcal',
    macroRatio: 'Rapid Glycogen Burn',
    description:
      'High-resistance strength training triggers localized micro-tears, queuing muscle protein synthesis requirements.',
  },
  {
    id: 'sleep',
    name: 'Deep Sleep & Repair',
    arabicName: 'نوم عميق واستشفاء',
    image: 'characters/sleep.webp',
    mood: 'Restorative REM Phase',
    statusTag: 'Anabolic Recovery',
    statusColor: '#6366F1',
    metabolicNote: 'Human growth hormone (HGH) pulse active. Basal metabolic rate settled at 68 kcal/hr.',
    caloriesDelta: '-520 kcal (Overnight)',
    macroRatio: 'Cellular Regeneration',
    description:
      'Fuzzy curls up during nocturnal rest. Cellular repair and memory consolidation solidify physical recovery.',
  },
  {
    id: 'goal-done',
    name: 'Milestone Achieved',
    arabicName: 'إنجاز الهدف اليومي',
    image: 'characters/goal-done.webp',
    mood: 'Triumphant & Balanced',
    statusTag: 'Target Hit (100%)',
    statusColor: '#F39C12',
    metabolicNote: 'Caloric balance hit within ±2% margin of error. Macronutrient split verified.',
    caloriesDelta: '2,450 / 2,450 kcal',
    macroRatio: '165P / 240C / 68F',
    description:
      'A golden moment of daily harmony. Fuzzy celebrates consistent nutritional habit formation and streak protection.',
  },
  {
    id: 'hiking',
    name: 'Endurance Trekking',
    arabicName: 'مسير صحراوي طويل',
    image: 'characters/hiking.webp',
    mood: 'Sustained Aerobic Focus',
    statusTag: 'Zone 2 Fat Oxidation',
    statusColor: '#E5A93C',
    metabolicNote: 'Sustained low-intensity pace. Lipid beta-oxidation fuels muscular contractions.',
    caloriesDelta: '-680 kcal',
    macroRatio: 'Fat Oxidation Dominant',
    description:
      'Traversing the ancient monoliths of Tadrart Acacus. Long-distance endurance burn under the vast Saharan sky.',
  },
  {
    id: 'relaxation',
    name: 'Mindful Recovery',
    arabicName: 'استرخاء واستعادة التوازن',
    image: 'characters/relaxation.webp',
    mood: 'Parasympathetic Dominance',
    statusTag: 'Cortisol Reset',
    statusColor: '#10B981',
    metabolicNote: 'Vagus nerve tone heightened. Systemic inflammation markers receding.',
    caloriesDelta: 'Resting State',
    macroRatio: 'Sympathetic Inactive',
    description:
      'Rest is non-negotiable. Fuzzy grounds himself on warm sandstone, balancing psychological and somatic strain.',
  },
]

// Macro Tokens Specification
const MACRO_TOKENS = [
  {
    name: 'Calories',
    arabic: 'السعرات الحرارية',
    target: '2,450 kcal',
    color: '#C85A32',
    bg: '#FDF3EE',
    border: '#F6CEBF',
    role: 'Basal & Active Expenditure',
    description: 'Calculated using Mifflin-St Jeor formula with adaptive activity coefficients.',
  },
  {
    name: 'Protein',
    arabic: 'البروتين',
    target: '165 g',
    color: '#D9534F',
    bg: '#FDF2F2',
    border: '#F8C8C7',
    role: 'Lean Tissue Preservation',
    description: 'Calibrated at 2.0g/kg lean body mass to optimize leucine triggers and satiety.',
  },
  {
    name: 'Carbohydrates',
    arabic: 'الكربوهيدرات',
    target: '240 g',
    color: '#E5A93C',
    bg: '#FEF8EE',
    border: '#F8DEC0',
    role: 'Glycogen & Cognitive Fuel',
    description: 'Complex fibrous sources prioritized for steady insulin and glycogen replenishment.',
  },
  {
    name: 'Healthy Fats',
    arabic: 'الدهون الصحية',
    target: '68 g',
    color: '#2A9D8F',
    bg: '#EFF9F8',
    border: '#C0E9E4',
    role: 'Hormonal Synthesis',
    description: 'Monounsaturated and omega-3 profiles essential for endocrine signaling.',
  },
]

export default function AkakusBrandExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCompanionState, setActiveCompanionState] = useState<CompanionState>(COMPANION_STATES[0])
  const [selectedMacro, setSelectedMacro] = useState(MACRO_TOKENS[0])
  const [activeTab, setActiveTab] = useState<'overview' | 'companion' | 'product' | 'system'>('overview')

  // Scoped GSAP ScrollTrigger transitions
  useBrandGsap((gsap, ScrollTrigger) => {
    if (!containerRef.current) return

    gsap.fromTo(
      '.akakus-fade-up',
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.akakus-hero-section',
          start: 'top 80%',
        },
      }
    )

    gsap.fromTo(
      '.akakus-card-reveal',
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.akakus-gallery-section',
          start: 'top 75%',
        },
      }
    )
  }, [containerRef])

  return (
    <BrandShell
      brandName="Akakus"
      tagline="AI Calorie & Nutrition Tracker with Living Companion"
      accentColor="#C85A32"
      backHref="/projects"
      backLabel="Portfolio"
      className="bg-[#FDFBF7] text-[#1A1918] selection:bg-[#C85A32] selection:text-white"
      style={{
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      }}
    >
      <div ref={containerRef} className="relative w-full">
        {/* =========================================================
            1. HERO SECTION (Editorial Craftsmanship inspired by Tolan / dmcg.co)
           ========================================================= */}
        <section className="akakus-hero-section relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          {/* Subtle desert atmospheric glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C85A32]/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#E5A93C]/5 rounded-full blur-2xl pointer-events-none -z-10" />

          {/* Top Brand Category Pill */}
          <div className="akakus-fade-up flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F6F3EC] text-[#5C5852] border border-[#EAE5D9]">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              AI Calorie & Nutrition Mobile System
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FDF3EE] text-[#C85A32] border border-[#F6CEBF]">
              React Native / Expo 57
            </span>
          </div>

          {/* Massive Confident Title */}
          <div className="akakus-fade-up">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-[#1A1918] leading-[0.9] mb-4">
              AKAKUS
            </h1>
            <p className="font-arabic text-2xl md:text-3xl text-[#5C5852] font-semibold mb-8 tracking-wide">
              أكاكوس — رفيق التغذية الذكي وقياس السعرات
            </p>
          </div>

          {/* Editorial Lead Paragraph */}
          <div className="akakus-fade-up grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            <div className="lg:col-span-8">
              <p className="text-xl sm:text-2xl md:text-3xl text-[#1A1918] font-normal leading-relaxed mb-6">
                Akakus is an AI-powered nutrition companion rooted in the majestic sandstone monoliths of the Sahara.
                It rejects generic, anxiety-inducing fitness spreadsheets in favor of a calm, Apple Health-grade editorial
                experience driven by <strong className="font-semibold text-[#C85A32]">Fuzzy</strong>—a living biometric
                companion who evolves alongside your daily habits.
              </p>
              <p className="text-base sm:text-lg text-[#5C5852] leading-relaxed">
                By pairing real-time Google Gemini 2.5 Flash Vision photo analysis with a warm, tactile design language
                and rock-solid bidirectional typography, Akakus transforms metabolic tracking into an intuitive, respectful
                daily ritual.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end gap-4">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#F1EDE3]">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#8C867D]">Client / Product</span>
                  <span className="text-sm font-semibold text-[#1A1918]">Akakus Health Inc.</span>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#F1EDE3]">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#8C867D]">Timeline</span>
                  <span className="text-sm font-semibold text-[#1A1918]">2026 Production</span>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#F1EDE3]">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#8C867D]">Services</span>
                  <span className="text-sm font-semibold text-[#1A1918]">Brand, Mobile App, AI Vision</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#8C867D]">Inspiration</span>
                  <span className="text-sm font-semibold text-[#C85A32]">Tadrart Acacus (Sahara)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation Bar */}
          <div className="akakus-fade-up flex flex-wrap gap-2 pt-4">
            {[
              { id: 'overview', label: '1. Brand Narrative' },
              { id: 'companion', label: '2. The Living Fuzzy Companion' },
              { id: 'product', label: '3. Mobile App Interface' },
              { id: 'system', label: '4. Design Tokens & Bidi System' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  const el = document.getElementById(tab.id)
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1A1918] text-[#FDFBF7] shadow-sm'
                    : 'bg-[#F6F3EC] text-[#5C5852] hover:bg-[#EAE5D9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================
            2. NARRATIVE & CONCEPT: The Acacus Sandstone & Fuzzy
           ========================================================= */}
        <section id="overview" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold block mb-3">
                Origins & Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1918] mb-6 leading-tight">
                What if nutrition tracking felt like a sanctuary?
              </h2>
              <div className="space-y-4 text-base sm:text-lg text-[#5C5852] leading-relaxed">
                <p>
                  Most calorie apps bombard users with fluorescent alerts, red guilt badges, and rigid charts. The result
                  is chronic friction and user burnout within weeks.
                </p>
                <p>
                  Akakus takes its name and soul from the ancient <strong>Tadrart Acacus</strong> mountain range in southwestern
                  Libya—a UNESCO world heritage landscape of towering red sandstone arches, weathered natural monuments,
                  and millennia-old rock engravings.
                </p>
                <p>
                  We translated these earth tones into an architectural digital sanctuary: warm sand bone canvases, tactile
                  borders, and rich terracotta accents.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-3xl font-bold text-[#1A1918]">98.4%</p>
                  <p className="text-xs font-mono text-[#8C867D] uppercase tracking-wider">Vision Accuracy</p>
                </div>
                <div className="w-px h-10 bg-[#EAE5D9]" />
                <div>
                  <p className="text-3xl font-bold text-[#C85A32]">44pt</p>
                  <p className="text-xs font-mono text-[#8C867D] uppercase tracking-wider">Tactile Touch Grid</p>
                </div>
                <div className="w-px h-10 bg-[#EAE5D9]" />
                <div>
                  <p className="text-3xl font-bold text-[#1A1918]">WCAG AA</p>
                  <p className="text-xs font-mono text-[#8C867D] uppercase tracking-wider">Strict Contrast Ratio</p>
                </div>
              </div>
            </div>

            {/* Brand Visual Anchor */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden border border-[#EAE5D9] bg-[#FFFFFF] shadow-lg p-3 sm:p-4">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#161514]">
                  <Image
                    src={getBrandMediaUrl('akakus', 'brand/akakus-dark.JPG')}
                    alt="Akakus Sandstone Brand Identity and Mobile Vision"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white text-lg font-semibold">Tadrart Acacus Visual System</p>
                      <p className="text-slate-300 text-xs">Warm sandstone bone (#FDFBF7) and deep nocturnal charcoal (#161514)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. INTERACTIVE SHOWCASE: The Living Fuzzy Companion
           ========================================================= */}
        <section id="companion" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold block mb-3">
              Character-Driven Experience
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1918] mb-4">
              Meet Fuzzy: The Living Companion
            </h2>
            <p className="text-base sm:text-lg text-[#5C5852] leading-relaxed">
              Inspired by the playful character dimensionality of David McGillivray&apos;s Tolan work, Fuzzy bridges the gap
              between clinical nutrition mathematics and emotional connection. Tap a biometric state below to inspect
              how Fuzzy adapts to daily human life.
            </p>
          </div>

          {/* Interactive State Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {COMPANION_STATES.map(state => {
              const isActive = activeCompanionState.id === state.id
              return (
                <button
                  key={state.id}
                  onClick={() => setActiveCompanionState(state)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#C85A32] text-white shadow-md scale-105'
                      : 'bg-[#FFFFFF] text-[#5C5852] border border-[#EAE5D9] hover:border-[#C85A32]/40 hover:text-[#1A1918]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: state.statusColor }}
                  />
                  <span>{state.name}</span>
                </button>
              )
            })}
          </div>

          {/* Companion Display Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFFFFF] rounded-3xl border border-[#EAE5D9] p-6 sm:p-10 shadow-sm">
            {/* Left: Animated Character Stage */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center">
                {/* Specular Liquid Glass Ring Platform */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[#F6F3EC] to-[#FAF8F3] border border-[#EAE5D9] shadow-inner -z-10" />
                <div
                  className="absolute w-64 h-64 rounded-full blur-2xl opacity-20 -z-10 transition-colors duration-500"
                  style={{ backgroundColor: activeCompanionState.statusColor }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCompanionState.id}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80"
                  >
                    <Image
                      src={getBrandMediaUrl('akakus', activeCompanionState.image)}
                      alt={`Fuzzy the Companion - ${activeCompanionState.name}`}
                      fill
                      className="object-contain drop-shadow-xl"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Status Badge beneath Fuzzy */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F6F3EC] border border-[#EAE5D9] text-xs font-mono font-medium text-[#5C5852] mt-4">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeCompanionState.statusColor }} />
                <span>{activeCompanionState.statusTag}</span>
              </div>
            </div>

            {/* Right: Metabolic Telemetry & Companion Personality */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-mono font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: activeCompanionState.statusColor }}
                  >
                    Biometric State
                  </span>
                  <span className="text-xs font-mono text-[#8C867D]">
                    ID: {activeCompanionState.id}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#1A1918]">
                  {activeCompanionState.name}
                </h3>
                <p className="font-arabic text-xl text-[#5C5852] font-semibold mt-1">
                  {activeCompanionState.arabicName}
                </p>
              </div>

              <p className="text-base text-[#5C5852] leading-relaxed">
                {activeCompanionState.description}
              </p>

              {/* Metabolic Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE5D9]">
                  <p className="text-xs font-mono text-[#8C867D] uppercase tracking-wider mb-1">
                    Caloric Delta
                  </p>
                  <p className="text-xl font-bold text-[#1A1918]">
                    {activeCompanionState.caloriesDelta}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE5D9]">
                  <p className="text-xs font-mono text-[#8C867D] uppercase tracking-wider mb-1">
                    Macronutrient Ratio
                  </p>
                  <p className="text-sm font-semibold text-[#1A1918] truncate">
                    {activeCompanionState.macroRatio}
                  </p>
                </div>
              </div>

              {/* Physiological Analysis Box */}
              <div className="p-4 rounded-xl bg-[#FDF3EE] border border-[#F6CEBF] text-xs leading-relaxed text-[#5C5852]">
                <strong className="text-[#C85A32] block mb-1 font-semibold">
                  Metabolic Analysis:
                </strong>
                {activeCompanionState.metabolicNote}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. PRODUCT INTERFACE GALLERY: Real Screens from Desktop
           ========================================================= */}
        <section id="product" className="akakus-gallery-section py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold block mb-3">
              Application Surfaces
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1918] mb-4">
              Tactile Native Interface Architecture
            </h2>
            <p className="text-base sm:text-lg text-[#5C5852] leading-relaxed">
              Every screen is engineered with a strict 4pt vertical rhythm, 44pt minimum touch targets, and pure React Native
              Liquid Glass materials featuring top-down specular highlight borders.
            </p>
          </div>

          {/* Grid Layout of Real App Screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Screen 1: Welcome & Onboarding Entry */}
            <div className="akakus-card-reveal group rounded-3xl bg-[#FFFFFF] border border-[#EAE5D9] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-[4/5] w-full bg-[#FAF8F3] overflow-hidden">
                <Image
                  src={getBrandMediaUrl('akakus', 'ui/welcome-screen-ui-design.png')}
                  alt="Akakus Welcome Screen Design"
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-[#F1EDE3]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#1A1918]">Welcome & Identity Entry</h4>
                  <span className="text-xs font-mono text-[#8C867D]">01 / Onboarding</span>
                </div>
                <p className="text-sm text-[#5C5852] leading-relaxed">
                  Welcomes users with the Acacus sandstone silhouette, setting expectations for a peaceful, non-punitive tracking habit.
                </p>
              </div>
            </div>

            {/* Screen 2: Home Screen & Daily Tracking */}
            <div className="akakus-card-reveal group rounded-3xl bg-[#FFFFFF] border border-[#EAE5D9] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-[4/5] w-full bg-[#FAF8F3] overflow-hidden">
                <Image
                  src={getBrandMediaUrl('akakus', 'ui/example-home-screen-ui.png')}
                  alt="Akakus Home Screen with Macro Rings and Meal Stream"
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-[#F1EDE3]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#1A1918]">Home Dashboard & 3-Week Strip</h4>
                  <span className="text-xs font-mono text-[#C85A32] font-semibold">Core Dashboard</span>
                </div>
                <p className="text-sm text-[#5C5852] leading-relaxed">
                  3-week interactive calendar strip, concentric macro progress rings, and real-time photo status tracking via Trigger.dev.
                </p>
              </div>
            </div>

            {/* Screen 3: Settings & Biometric Formula Engine */}
            <div className="akakus-card-reveal group rounded-3xl bg-[#FFFFFF] border border-[#EAE5D9] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-[4/5] w-full bg-[#FAF8F3] overflow-hidden">
                <Image
                  src={getBrandMediaUrl('akakus', 'ui/settings-screen-design.PNG')}
                  alt="Akakus Settings and Target Adjustments"
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-[#F1EDE3]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#1A1918]">Settings & Metabolic Engine</h4>
                  <span className="text-xs font-mono text-[#8C867D]">03 / Controls</span>
                </div>
                <p className="text-sm text-[#5C5852] leading-relaxed">
                  Precision targets derived from biometric formulas, unit switching (Metric/Imperial), and complete GDPR account erasure.
                </p>
              </div>
            </div>
          </div>

          {/* Full-Bleed Onboarding Flow Panorama */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1918]">9-Step Biometric Onboarding Questionnaire</h3>
                <p className="text-sm text-[#5C5852]">From demographic baseline to personalized Mifflin-St Jeor daily caloric budget.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F6F3EC] text-[#5C5852] border border-[#EAE5D9]">
                Zero Ad-hoc Strings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden border border-[#EAE5D9] bg-[#FAF8F3]">
                <Image
                  src={getBrandMediaUrl('akakus', 'ui/onboarding-1-5.png')}
                  alt="Akakus Onboarding Steps 1 to 5"
                  width={900}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 border-t border-[#EAE5D9] bg-[#FFFFFF]">
                  <p className="text-xs font-mono text-[#8C867D]">Phase 1: Biometric Inputs (Gender, DOB, Height, Weight, Activity)</p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#EAE5D9] bg-[#FAF8F3]">
                <Image
                  src={getBrandMediaUrl('akakus', 'ui/onboarding-5-10.png')}
                  alt="Akakus Onboarding Steps 5 to 9"
                  width={900}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 border-t border-[#EAE5D9] bg-[#FFFFFF]">
                  <p className="text-xs font-mono text-[#8C867D]">Phase 2: Goal Strategy, Deficit Pacing & Diet Selection</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. DESIGN TOKENS & BIDI ARABIC TYPOGRAPHY SYSTEM
           ========================================================= */}
        <section id="system" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold block mb-3">
              Design Foundations
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1918] mb-4">
              Macronutrient Tokens & Bidi Isolation
            </h2>
            <p className="text-base sm:text-lg text-[#5C5852] leading-relaxed">
              Every token is rigorously vetted for accessibility, semantic coherence, and bidirectional layout purity.
            </p>
          </div>

          {/* Macro Token Palette Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {MACRO_TOKENS.map(token => (
              <div
                key={token.name}
                onClick={() => setSelectedMacro(token)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedMacro.name === token.name
                    ? 'border-[#C85A32] shadow-md -translate-y-1'
                    : 'border-[#EAE5D9] bg-[#FFFFFF] hover:border-[#C85A32]/40'
                }`}
                style={{ backgroundColor: token.bg }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#8C867D]">
                    {token.role}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-[#1A1918] mb-1">{token.name}</h4>
                <p className="font-arabic text-sm text-[#5C5852] font-medium mb-3">{token.arabic}</p>
                <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: token.color }}>
                  {token.target}
                </div>
                <p className="text-xs text-[#5C5852] mt-3 leading-relaxed border-t border-black/5 pt-3">
                  {token.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bidi Formatting & Arabic Typography Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFFFFF] rounded-3xl border border-[#EAE5D9] p-6 sm:p-10 shadow-sm">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#2A9D8F] font-semibold block">
                Bidirectional Engineering Invariant
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1918]">
                Arabic RTL Layouts & Western Digit Isolation
              </h3>
              <p className="text-sm sm:text-base text-[#5C5852] leading-relaxed">
                In mixed English and Arabic fitness applications, naive string concatenation causes layout engines
                to flip numbers or orphan grammatical units (e.g. rendering &quot;g 150&quot; instead of &quot;150 g&quot;).
              </p>
              <p className="text-sm sm:text-base text-[#5C5852] leading-relaxed">
                Akakus wraps every numerical metric in Unicode First Strong Isolate control characters:
              </p>
              <div className="p-4 rounded-xl bg-[#161514] text-[#FDFBF7] font-mono text-xs overflow-x-auto">
                <code>{`// Invariant: Zero ad-hoc template strings allowed
export function formatGrams(val: number): string {
  return \`\\u2066\${Math.round(val)} g\\u2069\`
}`}</code>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
                <span className="text-xs font-mono uppercase text-[#8C867D]">English Rendering</span>
                <span className="font-mono text-sm font-bold text-[#1A1918]">{'\u2066'}165 g Protein{'\u2069'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]" dir="rtl">
                <span className="text-xs font-mono uppercase text-[#8C867D]">عرض باللغة العربية</span>
                <span className="font-arabic text-sm font-bold text-[#1A1918]">{'\u2066'}١٦٥ غرام بروتين{'\u2069'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
                <span className="text-xs font-mono uppercase text-[#8C867D]">Calorie Budget</span>
                <span className="font-mono text-sm font-bold text-[#C85A32]">{'\u2066'}2,450 kcal / day{'\u2069'}</span>
              </div>
              <div className="flex items-center justify-between" dir="rtl">
                <span className="text-xs font-mono uppercase text-[#8C867D]">الميزانية اليومية</span>
                <span className="font-arabic text-sm font-bold text-[#C85A32]">{'\u2066'}٢,٤٥٠ سعرة حرارية{'\u2069'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. TECHNICAL ARCHITECTURE SPECIFICATION
           ========================================================= */}
        <section className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE5D9]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold block mb-3">
              Production Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1918] mb-4">
              Full-Stack System Architecture
            </h2>
            <p className="text-base text-[#5C5852]">
              Designed for zero-cold-start photo recognition and seamless multi-device state synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FDF3EE] text-[#C85A32] flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mb-1">Expo SDK 57</h4>
              <p className="text-xs text-[#5C5852] leading-relaxed">
                React Native 0.86 with typed Expo Router, NativeWind Tailwind CSS, and Apple HealthKit integration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#EFF9F8] text-[#2A9D8F] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mb-1">Gemini 2.5 Flash Vision</h4>
              <p className="text-xs text-[#5C5852] leading-relaxed">
                Multi-modal JSON structured output parsing food items, portion estimates, and macro density.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FEF8EE] text-[#E5A93C] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mb-1">Drizzle & Neon Postgres</h4>
              <p className="text-xs text-[#5C5852] leading-relaxed">
                Serverless relational storage with optimistic TanStack React Query caching for instant UI feedback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D9] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mb-1">Trigger.dev Workers v3</h4>
              <p className="text-xs text-[#5C5852] leading-relaxed">
                Resilient background workers orchestrating ImageKit thumbnailing and retrying AI vision parsing.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. FOOTER & BRAND TRANSITION
           ========================================================= */}
        <footer className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-[#1A1918]">
              Experience the Full Portfolio
            </h3>
            <p className="text-sm sm:text-base text-[#5C5852] leading-relaxed">
              Explore more interactive brand experiences, architectural case studies, and production codebases.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild className="bg-[#C85A32] hover:bg-[#B34E2A] text-white px-6 py-2.5 rounded-full shadow-sm">
                <Link href="/projects">
                  Back to Projects
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#EAE5D9] text-[#1A1918] hover:bg-[#F6F3EC] px-6 py-2.5 rounded-full">
                <Link href="/experiences">
                  View All Brand Canvases
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            <p className="text-xs font-mono text-[#8C867D] pt-8">
              Akakus Brand Experience © 2026. Designed with Salih Ben Otman Portfolio Design System.
            </p>
          </div>
        </footer>
      </div>
    </BrandShell>
  )
}
