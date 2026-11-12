# 09 — Phased Implementation Roadmap & Testing Protocol

> **Audit Stamped:** 2026-11-12  
> **Target Application:** Al-Edrisy Personal Engineering Portfolio  
> **Production URL:** [https://al-edrisy.up.railway.app](https://al-edrisy.up.railway.app)  
> **Scope:** Phased Execution Blueprint, File Manifest, Testing Matrix, and Approval Gate

---

## 1. Implementation Philosophy

This roadmap translates the audit findings into a structured, low-risk, five-phase rollout.

Every phase adheres to three invariants:
1. **Zero modification to existing presentation logic:** Existing portfolio cards, detail pages, and global layouts remain fully operational at every step.
2. **Surgical, isolated additions:** All new components, hooks, and configurations live in dedicated directories (`experiences/`, `app/experiences/`).
3. **Rigorous verification gate:** Every phase must satisfy automated unit tests, manual visual regression checks, and responsive validation before proceeding to the next phase.

---

## 2. Phased Implementation Plan

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Core Foundation & Route Registration               │
│   • Types, Engine Shell, Scoped Routing, 404 Recovery       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Brand Engine & Section Component Registry          │
│   • Hero, Story, Showcase, Identity, Capabilities, Closing  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: GSAP Scroll Choreography & Media Pipeline          │
│   • Scoped ScrollTrigger, Horizontal Reel, Video Streaming  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Pilot Brand Implementation (Pronto.Eats & 7A)       │
│   • Manifests, Asset Wiring, Theming, Mobile Polish         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Non-Destructive Portfolio Integration & QA         │
│   • Action Button Entry Point, Verification Checklist, Ship │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Core Foundation & Scoped Routing Architecture

- **Objective:** Establish the routing endpoint, type definitions, and scoped CSS theme foundation without touching any existing user-facing UI.
- **Files to Create:**
  - `experiences/configurations/types.ts` (Manifest and section schema)
  - `experiences/engine/brand-context.tsx` (Theme & manifest React context)
  - `experiences/styles/brand-engine.css` (Scoped `--brand-*` utilities)
  - `app/experiences/[slug]/page.tsx` (Server Component route handler & SEO generator)
  - `app/experiences/[slug]/loading.tsx` (Suspense loading skeleton)
  - `app/experiences/[slug]/not-found.tsx` (Branded 404 recovery screen)
- **Existing Files Affected:**
  - `types/index.ts` (Additive: append `BrandExperienceConfig` and optional `brandExperience?: BrandExperienceConfig` to `Project` interface).
- **Dependencies:** None. Uses existing React 19 and Next.js 15.
- **Expected Outcome:** Hitting `/experiences/pronto` loads a working, branded shell with dynamic SEO metadata; hitting an invalid slug renders a clean 404 recovery page.
- **Testing Requirements:**
  - Direct URL access to `/experiences/pronto` works on initial load and refresh.
  - Breadcrumbs and return links navigate back cleanly.
  - Vitest test suite (`npm run test`) continues passing 100%.
- **Regression Risk:** **Zero**. Lives in an isolated route tree.

---

### Phase 2: Brand Engine & Section Registry

- **Objective:** Build the modular section components that assemble a brand presentation.
- **Files to Create:**
  - `experiences/engine/brand-experience-renderer.tsx` (Dynamic section dispatcher)
  - `experiences/engine/section-registry.ts` (Maps section types to components)
  - `experiences/components/brand-navigation.tsx` (Sticky brand header with anchor links)
  - `experiences/components/brand-button.tsx` (Scoped tactile interactive button)
  - `experiences/components/device-mockup.tsx` (Mobile and desktop device frames)
  - `experiences/sections/hero/brand-hero-section.tsx` (Cinematic typography + media)
  - `experiences/sections/story/brand-story-section.tsx` (Narrative & philosophy)
  - `experiences/sections/showcase/brand-showcase-section.tsx` (Interactive mockup)
  - `experiences/sections/identity/brand-identity-section.tsx` (Color tokens & typography)
  - `experiences/sections/capabilities/brand-capabilities-section.tsx` (Interactive capability cards)
  - `experiences/sections/engineering/brand-engineering-section.tsx` (Architecture & metrics)
  - `experiences/sections/closing/brand-closing-section.tsx` (Closing CTA & exit to portfolio)
- **Existing Files Affected:** None.
- **Dependencies:** Lucide React icons, existing Radix primitives.
- **Expected Outcome:** The engine dynamically renders any sequence of sections specified in a brand configuration.
- **Testing Requirements:**
  - Sections can be reordered purely through configuration.
  - Toggling `enabled: false` cleanly omits a section from rendering.
  - Theme colors render using `--brand-*` tokens without leaking to portfolio elements.
- **Regression Risk:** **Zero**.

---

### Phase 3: GSAP Scroll Choreography & Media Pipeline

- **Objective:** Implement hardware-accelerated scroll interactions, pinned galleries, and lazy video streaming.
- **Files to Create:**
  - `experiences/engine/hooks/use-brand-gsap.ts` (Scoped GSAP manager with auto-revert)
  - `experiences/sections/gallery/brand-gallery-section.tsx` (Horizontal pinned scroll gallery on desktop, swipeable cards on mobile)
  - `experiences/components/media-player.tsx` (IntersectionObserver video player with poster fallback and range streaming)
- **Existing Files Affected:** None.
- **Dependencies:** Existing `gsap` and `ScrollTrigger`.
- **Expected Outcome:** Desktop users experience smooth, pinned scroll reels; mobile users get performant, zero-lag vertical touch layouts.
- **Testing Requirements:**
  - Unmounting the page (navigating back to portfolio) kills all GSAP pin spacers and tweens.
  - Navigating back and forth 10 times produces zero memory leaks or stray scroll triggers.
  - Video streams do not autoplay audio and pause immediately when scrolled out of view.
  - `prefers-reduced-motion` suppresses spatial motion and horizontal pinning.
- **Regression Risk:** **Low**. Scoped inside `gsap.context()` to guarantee zero DOM pollution.

---

### Phase 4: Pilot Brand Implementation (Pronto.Eats & 7A)

- **Objective:** Wire up complete, production-grade brand experiences for two distinct brands demonstrating divergent design systems.
- **Files to Create:**
  - `experiences/configurations/pronto.config.ts` (Pronto.Eats: expressive food tech identity, bold red/amber palette, mobile ordering demo, architecture breakdown)
  - `experiences/configurations/seven-a.config.ts` (7A: refined luxury hospitality identity, deep obsidian/gold palette, desktop suite preview, reservation flow)
  - `experiences/configurations/index.ts` (Central brand experience registry)
- **Existing Files Affected:** None.
- **Dependencies:** Cloudflare R2 media assets (or local fallbacks in `public/`).
- **Expected Outcome:** Both `/experiences/pronto` and `/experiences/7a` render complete, immersive brand journeys with distinct visual personalities.
- **Testing Requirements:**
  - Pronto.Eats and 7A look completely distinct in typography, colors, and layout.
  - Neither brand's styling affects the other or the main portfolio.
  - Performance audit confirms LCP $\le 1.8\text{s}$, INP $\le 100\text{ms}$, CLS $\le 0.02$.
- **Regression Risk:** **Zero**.

---

### Phase 5: Non-Destructive Portfolio Integration & Comprehensive Verification

- **Objective:** Connect the existing portfolio to the new experiences via non-intrusive action buttons, and execute the final verification checklist.
- **Files to Modify:**
  - `components/projects/project-page-client.tsx` (Add conditional "Explore Brand Experience" button in sidebar action buttons column when `project.brandExperience?.enabled` is true).
- **Files to Create:**
  - Automated integration test in `__tests__/components/brand-experience.property.test.ts` verifying manifest validation, slug resolution, and theme isolation.
- **Existing Files Affected:** Only `components/projects/project-page-client.tsx`.
- **Dependencies:** None.
- **Expected Outcome:** Visitors exploring a project with a brand experience see a prominent, elegant CTA to enter the experience. Projects without an experience remain 100% identical to production today.
- **Testing Requirements:** Complete verification checklist (see Section 3).
- **Regression Risk:** **Negligible**. Condition guarded by strict optional check.

---

## 3. Comprehensive Verification & Testing Protocol

Before sign-off, the following two-part testing protocol must be executed:

### Part A: Baseline Portfolio Verification Checklist (Zero Regression)
- [ ] **Home Page:** Loads cleanly at `/`, renders hero, skills ticker, services, featured projects, GitHub activity, feedback, and contact.
- [ ] **Projects Page:** Loads at `/projects`, renders both Grid and List views, infinite scroll works, search/filter works.
- [ ] **Project Cards:** Card hover animations, GSAP parallax, tech stack badges, and reaction pickers operate with zero console errors.
- [ ] **Project Details:** `/projects/[id]` renders cover image, gallery carousel, video player, markdown descriptions, documentation visualizer, reactions, and discussion comments.
- [ ] **External Links:** "Live Demo" and "Source Code" open valid URLs in new tabs with `noopener noreferrer`.
- [ ] **Skills Page:** `/skills` renders category filters, search input, and interactive skill cards.
- [ ] **About Page:** `/about` renders biography, timeline, and video demo.
- [ ] **Contact Page:** `/contact` form submits correctly and sends email via SMTP service.
- [ ] **Navigation & History:** Top navigation bar hides on downward scroll and reveals on upward scroll. Browser back/forward navigation operates flawlessly.
- [ ] **Theme Switching:** Dark mode and light mode toggle cleanly without broken CSS tokens or flash of unstyled content.
- [ ] **Automated Tests:** All 8 test suites (89 tests) pass with exit code 0 (`npm run test`).

### Part B: Brand Experience Verification Checklist
- [ ] **Slug Resolution:** Navigating to `/experiences/pronto` and `/experiences/7a` renders the correct brand.
- [ ] **Theme Encapsulation:** Brand primary colors, background tones, and typography are strictly confined to the brand canvas and never leak into global styles.
- [ ] **Typography:** Custom brand fonts load with `font-display: swap` without blocking first paint.
- [ ] **Media & Video:** Hero videos load asynchronously with poster fallbacks; videos play when in view and pause when out of view; audio is strictly muted until explicit user interaction.
- [ ] **Scroll Choreography:** Pinned horizontal reels glide smoothly on desktop; layout adapts to stacked vertical cards on mobile.
- [ ] **Memory Lifecycle:** Navigating back to `/projects` destroys all ScrollTrigger instances and pin-spacers cleanly with no leftover inline DOM styles.
- [ ] **Accessibility & Motion:** When `prefers-reduced-motion` is enabled, all spatial pinning and animations collapse to instant cross-fades.
- [ ] **Direct Access & Refresh:** Refreshing (`Cmd+R`) on `/experiences/[slug]` re-renders cleanly without SSR hydration errors or 404s.
- [ ] **404 Recovery:** Navigating to `/experiences/unknown-brand` displays a branded recovery screen with a 1-click return to `/projects`.

---

## 4. Architectural Approval Gate

> [!IMPORTANT]
> **RULE 10 ENFORCEMENT: STOP AND WAIT FOR APPROVAL**  
> Per assignment instructions, **no implementation code will be written until the user reviews this audit and provides explicit authorization to proceed.**  
> All 9 audit deliverables are committed and ready for inspection in `docs/brand-experience-audit/`.
