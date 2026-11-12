# 05 — Brand Experience Architecture & Reusability Assessment

> **Audit Stamped:** 2026-11-12  
> **Target Application:** Al-Edrisy Personal Engineering Portfolio  
> **Production URL:** [https://al-edrisy.up.railway.app](https://al-edrisy.up.railway.app)  
> **Scope:** Modular Experience Engine, Section Registry, Theme Isolation, GSAP Lifecycle, and Directory Structure

---

## 1. Architectural Strategy: Isolated Module vs. Separate Application

The prompt asked us to investigate whether a separate Vite application, an isolated React module within Next.js, or another approach is the best fit.

### 1.1 Technical Comparison

| Dimension | Separate Vite Sub-Application (`/apps/brand-exp`) | Integrated Next.js Module (`app/experiences/[slug]`) — **RECOMMENDED** |
| :--- | :--- | :--- |
| **Build & Deploy Complexity** | Multi-package monorepo (Turborepo/pnpm workspaces), multiple build scripts, complex Railway routing proxies. | Single unified build (`next build`), zero deployment friction on Railway. |
| **Technology Stack** | Re-duplicates React 19, GSAP, Tailwind dependencies in a secondary `package.json`. | Native re-use of already installed and tested dependencies (`gsap: ^3.13.0`, `next: ^15.3.3`, `@aws-sdk/client-s3`). |
| **SEO & OpenGraph** | Client-side only rendering unless configuring complex SSR or pre-rendering plugins. | Full Next.js Server Components with dynamic OpenGraph, Twitter cards, and Schema.org metadata for each brand. |
| **Shared Media Infrastructure** | Must re-implement Cloudflare R2 proxy or CORS auth. | Instantly leverages `/api/media/[...key]` and `lib/storage/storage-provider.ts`. |
| **Independent Static Export** | Naturally outputs static `dist/`. | Easily exported via Next.js `generateStaticParams()` or an automated export script (`scripts/export-brand-experience.ts`). |

**Architectural Decision:** An **isolated, modular Experience Engine built directly within the existing Next.js App Router** is decisively the cleanest, most maintainable, and most performant architecture for this portfolio. It delivers 100% of the visual and runtime independence of a standalone app without the operational overhead of a multi-app monorepo.

---

## 2. The Experience Engine Architecture

We propose a composable, configuration-driven architecture:

```
experiences/
│
├── engine/                            <-- Core Rendering & Layout Engine
│   ├── brand-experience-renderer.tsx  <-- Dynamic Section Dispatcher & Context Provider
│   ├── brand-context.tsx              <-- React Context for Brand Theme & Config
│   ├── section-registry.ts            <-- Dynamic registry mapping section types to components
│   └── hooks/
│       ├── use-brand-gsap.ts          <-- Scoped GSAP context & ScrollTrigger auto-cleanup
│       ├── use-media-loader.ts        <-- Lazy progressive media resolution
│       └── use-sound-effect.ts        <-- Optional audio feedback (strict user interaction only)
│
├── sections/                          <-- Flexible Section Component Library
│   ├── hero/                          <-- Full-screen cinematic hero (Video/Poster/3D/Type)
│   ├── story/                         <-- Brand narrative, mission & design philosophy
│   ├── showcase/                      <-- Interactive product mockup / browser / mobile frame
│   ├── identity/                      <-- Visual identity: logos, color swatches, typography
│   ├── gallery/                       <-- High-impact media carousel or horizontal-scroll reel
│   ├── capabilities/                  <-- Interactive feature cards, tabs & micro-interactions
│   ├── engineering/                   <-- Architecture breakdown, tech badges & metrics
│   └── closing/                       <-- Cinematic closing CTA & "Back to Portfolio" exit
│
├── components/                        <-- Shared Brand-Specific UI Primitives
│   ├── brand-navigation.tsx           <-- Minimal sticky brand header with anchor links
│   ├── brand-button.tsx               <-- Tactile button styled with var(--brand-*) tokens
│   ├── device-mockup.tsx              <-- Mobile / Desktop frame for product demos
│   └── media-player.tsx               <-- Video player with poster fallback & lazy loading
│
├── configurations/                    <-- Declarative Brand Manifests
│   ├── index.ts                       <-- Registry of active brand experiences
│   ├── types.ts                       <-- Strict TypeScript schema for brand manifests
│   ├── pronto.config.ts               <-- Pronto.Eats configuration
│   ├── seven-a.config.ts              <-- 7A Luxury Hospitality configuration
│   ├── ispani.config.ts               <-- Ispani Sports configuration
│   └── akakus.config.ts               <-- Akakus configuration
│
└── styles/
    └── brand-engine.css               <-- Base utilities for pinned sections & horizontal scroll
```

---

## 3. Strict Declarative Brand Manifest Schema

Each showcased brand is declared through a strongly-typed configuration object:

```typescript
// experiences/configurations/types.ts
export type SectionType = 
  | 'hero' 
  | 'story' 
  | 'showcase' 
  | 'identity' 
  | 'gallery' 
  | 'capabilities' 
  | 'engineering' 
  | 'closing'

export interface BrandSectionConfig<T = Record<string, any>> {
  id: string                     // Anchor ID for in-page navigation (e.g. 'story')
  type: SectionType              // Matches component in section registry
  enabled?: boolean              // Easily toggle sections on/off
  data: T                        // Strictly typed payload for that section
}

export interface BrandThemeConfig {
  mode: 'dark' | 'light' | 'custom'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    muted: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
    customWebfontUrl?: string    // Optional WOFF2 URL on R2
  }
  radius: string                 // e.g. '16px', '24px', '8px'
}

export interface BrandExperienceManifest {
  slug: string                   // e.g. 'pronto'
  projectId: string              // Corresponds to Firestore project ID
  name: string                   // e.g. 'Pronto.Eats'
  tagline: string
  meta: {
    title: string
    description: string
    ogImage: string
  }
  theme: BrandThemeConfig
  navigation: {
    logoUrl: string
    logoAlt: string
    links: { label: string; href: string }[]
    ctaLabel?: string
    ctaUrl?: string
  }
  sections: BrandSectionConfig[] // Order in array determines page layout order!
}
```

### 3.1 Benefits of Section Registry & Ordering:
1. **Dynamic Ordering:** Changing the order of sections in `brand.sections` automatically re-orders the rendered page without touching React JSX.
2. **Optional Sections:** To omit a section (e.g., if a brand does not need an architecture section), simply exclude it from the array or set `enabled: false`.
3. **Multi-Brand Extensibility:** Adding a 5th, 6th, or 10th brand in the future requires creating **one file** (`experiences/configurations/new-brand.config.ts`) and registering it in `index.ts`. No routing or component changes required.

---

## 4. GSAP Animation Lifecycle & Scoped Cleanup

Scroll-based animations (pinned full-screen slides, parallax image panels, horizontal scroll galleries) are managed with strict lifecycle guarantees:

```typescript
// experiences/engine/hooks/use-brand-gsap.ts
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useBrandGsap(animationCallback: (ctx: gsap.Context) => void) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scopeRef.current) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Scoped context: Every tween & ScrollTrigger created inside is tracked
    const ctx = gsap.context(() => {
      animationCallback(ctx)
    }, scopeRef)

    // Complete cleanup on unmount: kills tweens, removes triggers, restores DOM inline styles
    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(t => {
        if (scopeRef.current && scopeRef.current.contains(t.trigger as Node)) {
          t.kill()
        }
      })
    }
  }, [animationCallback])

  return scopeRef
}
```

### 4.1 Memory Leak & Scroll Pin Prevention:
- Standard GSAP `ScrollTrigger` instances can leak memory or pollute window resize handlers if not destroyed upon page unmount.
- By wrapping each section in `gsap.context(..., scopeRef)` and calling `ctx.revert()`, when the user clicks "Back to Portfolio", all GSAP pin-spacers, event listeners, and transforms are instantly and completely removed from the DOM.

---

## 5. Future Capability: Independent Static Export

The prompt noted an optional future requirement: exporting an experience as a completely standalone static bundle (`dist/pronto/index.html`).

### 5.1 Feasibility Evaluation
Because the Brand Experience Engine is built on pure React components and declarative JSON-like manifests, creating an independent static build is straightforward:
1. **Option 1 (Native Next.js Export):**
   Using `output: 'export'` in Next.js or targeting the route with `generateStaticParams()` allows Next.js to pre-render `/experiences/pronto` into a standalone HTML file and companion JS/CSS bundle.
2. **Option 2 (Standalone Vite Bundler Script):**
   A lightweight script (`scripts/export-brand.ts`) can invoke Vite programmatically with a micro-template (`experiences/export-template/index.html`), injecting the brand's manifest and building an isolated, zero-dependency `dist/[brand]/` static folder ready to deploy to Cloudflare Pages, Netlify, or AWS S3.
