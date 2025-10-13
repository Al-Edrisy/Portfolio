# GSAP Animation Implementation for Project Cards

This document describes the GSAP animation implementation for project cards in the portfolio website.

## 🎯 Core Principle

GSAP is used **only to enhance motion clarity, not for decoration**. Every animation serves a purpose — improve flow, readability, or user focus — while preserving the functional visual identity of the website.

## ✨ Animation Features

### 1. **Subtle Scroll-triggered Reveal**

When the project card enters the viewport, elements (image, title, text, tech stack) fade in gently with a soft upward motion.

- **Implementation**: `gsap.timeline()` with `ScrollTrigger`
- **Easing**: `power2.out`
- **Duration**: 0.5s
- **Purpose**: Guide the eye naturally, not to decorate

```typescript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: cardRef.current,
    start: 'top 85%',
    end: 'top 20%',
    toggleActions: 'play none none reverse',
  }
})
```

### 2. **Minimal Tech Stack Appearance**

Tech icons appear one by one (fade + translateY: 10).

- **Stagger**: 0.05s between each icon
- **Animation**: Opacity 0→1, Y: 10→0
- **No rotation, scaling, or color changes** — just clean sequential motion

```typescript
tl.fromTo(
  techItems,
  { opacity: 0, y: 10 },
  {
    opacity: 1,
    y: 0,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.out',
  }
)
```

### 3. **Gentle Image Parallax** (Optional)

The image moves slightly slower on scroll (yPercent: -5), giving light depth without breaking layout discipline.

- **Effect**: `yPercent: -5`
- **Scrub**: 1 (smooth parallax)
- **Purpose**: Add subtle depth

```typescript
gsap.to(imageRef.current, {
  yPercent: -5,
  ease: 'none',
  scrollTrigger: {
    trigger: cardRef.current,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  }
})
```

### 4. **Soft Hover Feedback**

On hover, the card moves up slightly (scale: 1.005 or y: -3).

- **No color shifts or glowing** — just a tactile, responsive feel
- **Duration**: 0.3s
- **Easing**: `power2.out`

```typescript
gsap.to(cardRef.current, {
  y: isHovering ? -3 : 0,
  scale: isHovering ? 1.005 : 1,
  duration: 0.3,
  ease: 'power2.out',
})
```

### 5. **Unified Scroll Timeline**

All animations (text, image, icons) use one GSAP timeline to stay consistent in timing, easing, and smoothness.

- **Benefits**: 
  - Consistent timing
  - Smooth transitions
  - Clean rhythm across components
  - Better performance

## 🎨 Tech Stack Icons

### Icon Mapping System

The `tech-icon-mapper.ts` utility maps technology names to their corresponding SVG icon paths.

**Features:**
- Case-insensitive matching
- Comprehensive tech stack coverage
- Fallback to text if icon not found
- Organized by category (Languages, Frameworks, Tools, etc.)

**Usage:**

```typescript
import { getTechIconOrText } from '@/lib/tech-icon-mapper'

const { iconPath, displayName, hasIcon } = getTechIconOrText('React')
// iconPath: '/svg_tech_stack_icons/Frameworks/react-2.svg' (no change needed)
// displayName: 'React'
// hasIcon: true
```

### Available Icons

#### Programming Languages
- TypeScript, Python, C, C++, Node.js, Swift

#### Frameworks
- React, Next.js, Expo, PyTorch, TensorFlow, Stripe

#### Databases
- MongoDB, MySQL, PostgreSQL

#### Cloud & Infrastructure
- AWS, Firebase, Google Cloud

#### Tools & Services
- Docker, GitHub, Jenkins, Jira, Notion, Postman, Slack

#### AI & ML
- HuggingFace, OpenAI

#### Design & Animation
- Figma, GSAP

#### Hardware
- Arduino

## 📁 File Structure

```
portfolio/
├── components/
│   └── projects/
│       ├── cards/
│       │   ├── project-card.tsx           # Original card (kept for reference)
│       │   └── project-card-gsap.tsx      # ✨ New GSAP-enhanced card
│       ├── projects-list.tsx              # Updated to use GSAP card
│       └── modern-projects-list.tsx       # Updated to use GSAP card
├── lib/
│   └── tech-icon-mapper.ts                # Tech icon mapping utility
├── public/
│   └── svg_tech_stack_icons/              # SVG icons organized by category
└── docs/
    └── GSAP_ANIMATIONS.md                 # This file
```

## 🚀 Usage

The GSAP-enhanced project card is automatically used in:

1. **ProjectsList** (`/components/projects/projects-list.tsx`)
2. **ModernProjectsList** (`/components/projects/modern-projects-list.tsx`)

No additional configuration needed — the animations work out of the box.

## 🎛️ Customization

### Adjusting Animation Timing

Edit the timeline in `project-card-gsap.tsx`:

```typescript
// Faster animations
tl.fromTo(
  cardRef.current,
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.3 }  // Changed from 0.5
)
```

### Changing Parallax Intensity

```typescript
// More intense parallax
gsap.to(imageRef.current, {
  yPercent: -10,  // Changed from -5
  // ...
})
```

### Modifying Hover Effect

```typescript
// Stronger hover effect
gsap.to(cardRef.current, {
  y: isHovering ? -6 : 0,      // Changed from -3
  scale: isHovering ? 1.01 : 1, // Changed from 1.005
  // ...
})
```

## ⚡ Performance

- **GSAP** is hardware-accelerated and highly optimized
- **ScrollTrigger** uses IntersectionObserver for efficient scroll detection
- **will-change-transform** CSS property applied to animated elements
- Animations only run when elements are in viewport

## 🐛 Troubleshooting

### Animations not working?

1. Check if GSAP is installed: `gsap: latest` in `package.json`
2. Ensure ScrollTrigger is registered:
   ```typescript
   import { ScrollTrigger } from 'gsap/ScrollTrigger'
   gsap.registerPlugin(ScrollTrigger)
   ```
3. Verify refs are attached to DOM elements

### Icons not showing?

1. Check icon exists in `/public/svg_tech_stack_icons/`
2. Verify tech name mapping in `tech-icon-mapper.ts`
3. Check console for 404 errors

### Parallax too intense?

Reduce the `yPercent` value in the parallax animation (line ~170 in `project-card-gsap.tsx`)

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Easing Visualizer](https://greensock.com/docs/v3/Eases)

## 🎨 Design Philosophy

> "Motion should be purposeful. Every animation must enhance the user experience by improving clarity, guiding attention, or providing feedback. Avoid decorative motion that doesn't serve the content."

---

**Last Updated**: October 12, 2025
**Author**: Portfolio Development Team
**Version**: 1.0.0

