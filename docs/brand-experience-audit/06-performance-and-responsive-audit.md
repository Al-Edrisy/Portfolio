# 06 — Performance, Responsive & Quality Audit

> **Audit Stamped:** 2026-11-12  
> **Target Application:** Al-Edrisy Personal Engineering Portfolio  
> **Production URL:** [https://al-edrisy.up.railway.app](https://al-edrisy.up.railway.app)  
> **Scope:** Core Web Vitals (LCP, INP, CLS), Media Delivery, Video Streaming, Mobile Ergonomics, Accessibility, and Motion Performance

---

## 1. Core Web Vitals Assessment & Optimization Targets

To ensure the new Brand Experience feature does not harm the portfolio’s existing performance, the following engineering targets are established:

| Metric | Target | Risk Factor in Immersive Experiences | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | $\le 1.8\text{ s}$ | Heavy hero video or unoptimized high-res hero image delaying first paint. | Hero uses a lightweight, pre-compressed WebP/AVIF poster image with `fetchpriority="high"`. Video playback loads asynchronously and deferred. |
| **INP** (Interaction to Next Paint) | $\le 100\text{ ms}$ | Heavy JS scroll listeners blocking the main thread during fast scrolling. | GSAP ScrollTrigger updates run via hardware-accelerated RAF (RequestAnimationFrame) rather than React state updates. Zero React re-renders on scroll. |
| **CLS** (Cumulative Layout Shift) | $\le 0.02$ | Media mockups, fonts, or videos loading without defined aspect ratios. | All media containers use strict CSS `aspect-ratio` and dimension placeholders. Fonts use `size-adjust` or fallback match. |
| **FID / TBT** (Total Blocking Time) | $\le 150\text{ ms}$ | Parsing large JS animation bundles on mobile CPUs. | Dynamic imports (`next/dynamic`) for non-hero sections. The visitor only loads section code as they scroll. |

---

## 2. Media Loading & Video Streaming Protocol

Immersive brand presentations rely heavily on high-fidelity imagery and product video loops. The following protocols govern media delivery:

### 2.1 Video Loading Strategy
1. **Never Autoplay Full Video Stream on Initial Load:**
   - Videos must **never** load their complete byte stream upon initial page arrival.
   - Use `preload="none"` or `preload="metadata"`.
   - The video element is paired with an optimized WebP poster image (`poster="/..."`).
2. **Intersection-Observer Controlled Playback:**
   - Only when the video scrolls into the viewport (threshold $\ge 25\%$) does `video.play()` get requested.
   - When scrolled out of view, `video.pause()` is executed immediately to free GPU memory and conserve battery.
3. **Strict Audio Autoplay Policy:**
   - In accordance with browser security and WCAG UX principles, **audio must never autoplay under any circumstance**.
   - All background ambient video loops must be explicitly `muted`, `playsInline`, and `loop`.
   - Any audio tracks must require an explicit user gesture (e.g., clicking a floating "Enable Sound" button).
4. **Byte-Range Seeking via Existing Proxy:**
   - By routing R2 video assets through `app/api/media/[...key]`, video scrubbing and playback take advantage of HTTP 206 Partial Content range requests, allowing users to scrub smoothly without re-downloading entire video files.

### 2.2 Image Delivery Strategy
- Format: Next.js automatic image optimization (`next/image`) configured in `next.config.mjs:18` generates `image/avif` and `image/webp` with 30-day cache TTL (`minimumCacheTTL: 2592000`).
- Responsive srcset: Automatically delivers appropriate resolutions across mobile (640px), tablet (1024px), and 4K displays (3840px).

---

## 3. Responsive Layout & Mobile Ergonomics

A common flaw in agency portfolios is designing for 27-inch displays and simply scaling down element sizes on mobile. The Brand Experience engine implements section-level responsive ergonomics:

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ DESKTOP (>= 1024px)             │   │ MOBILE (< 768px)                │
│                                 │   │                                 │
│ • Pinned horizontal scroll reel │   │ • Vertical swipe carousel / list│
│ • Parallax multi-layer depth    │   │ • Parallax DISABLED (no lag)    │
│ • Side-by-side interactive demo │   │ • Stacked mockup + touch taps   │
│ • Custom mouse cursor magnet    │   │ • Native touch feedback         │
│ • Full split-text word reveal   │   │ • Grouped line-level opacity    │
│ • Hover tooltips & previews     │   │ • Expandable drawer / bottom-   │
│                                 │   │   sheet (Vaul primitive)        │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

### 3.1 Mobile-Specific Rules
1. **Disable CPU-Heavy Parallax:** On touch devices (`window.innerWidth < 768` or `pointer: coarse`), kill multi-layer parallax offset calculations. Rely on clean, native momentum scrolling.
2. **Touch Target Dimensions:** All buttons, navigation items, and interactive pills must satisfy a minimum touch target size of **$44 \times 44\text{ px}$** with adequate spacing (`gap-3` or greater).
3. **Viewport Height Stability:** Use `dvh` (Dynamic Viewport Height) rather than `vh` to prevent jumping when mobile browser URL bars collapse or expand during scroll.

---

## 4. Animation Performance & Accessibility Compliance

### 4.1 Zero React Re-Renders on Scroll
A catastrophic anti-pattern is binding `window.scrollY` or ScrollTrigger progress to React state (`useState(progress)`). This causes 60 to 120 re-renders per second, crippling mobile frame rates.
- **Rule:** GSAP directly transforms DOM element style properties via `transform` (GPU composite layer) and `opacity`. React component trees are never re-rendered by scrolling.
- Only GPU-accelerated CSS properties are animated:
  - `transform: translate3d(x, y, 0)`
  - `transform: scale(n)`
  - `opacity: n`
  - `filter: blur(n)` (used sparingly with `will-change: filter`)

### 4.2 Non-Destructive Reduced Motion Support
The application already features an accessible, non-destructive reduced-motion architecture in `app/globals.css:35-43`:
- When `prefers-reduced-motion: reduce` is detected:
  - Spatial movement (large translateY, slide-ins, rotations, and pinned scrolljacking) is completely suppressed.
  - Animations are collapsed to gentle opacity cross-fades ($100-200\text{ ms}$).
  - All content remains fully accessible and readable immediately without scrolling gymnastics.

### 4.3 Semantic Structure & Screen Reader Support
- Semantic HTML tags: `<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`.
- Dynamic Schema.org `WebSite` / `Product` JSON-LD embedded for search engines and assistive technology.
- High-contrast text compliance: Every color token generated for brand themes must be tested against WCAG 2.1 AA standards (minimum contrast ratio of 4.5:1 for body copy and 3.0:1 for large display headlines).
