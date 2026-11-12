# 02 — Routing & Navigation Architecture Audit

> **Audit Stamped:** 2026-11-12  
> **Target Application:** Al-Edrisy Personal Engineering Portfolio  
> **Production URL:** [https://al-edrisy.up.railway.app](https://al-edrisy.up.railway.app)  
> **Scope:** Routing Resolution, Browser History, Navigation Lifecycle, and Brand Experience Route Design

---

## 1. Existing Routing Map & Resolution Audit

The portfolio uses Next.js 15 App Router (`app/` directory). All routes map directly to file-system paths. The audit evaluated each route across 10 core dimensions:

```
app/
├── page.tsx                     --> / (Home)
├── about/page.tsx               --> /about
├── projects/
│   ├── page.tsx                 --> /projects (Directory)
│   ├── layout.tsx               --> Pass-through layout
│   ├── create/page.tsx          --> /projects/create (Admin only)
│   └── [id]/
│       ├── page.tsx             --> /projects/[id] (Dynamic Project Details)
│       └── edit/page.tsx        --> /projects/[id]/edit (Admin only)
├── skills/page.tsx              --> /skills
├── contact/page.tsx             --> /contact
├── profile/page.tsx             --> /profile
├── admin/                       --> /admin/* (Admin Suite)
├── api/                         --> /api/* (Route Handlers: upload, media, projects, feedback)
├── sitemap.ts                   --> /sitemap.xml
├── robots.ts                    --> /robots.txt
├── llms.txt/route.ts            --> /llms.txt
└── llms-full.txt/route.ts       --> /llms-full.txt
```

### 1.1 Detailed Evaluation of 10 Routing Dimensions

| Question / Dimension | Existing Behavior in Source Code | Technical Evidence & File Path |
| :--- | :--- | :--- |
| **1. Home page registration** | Root route `/` resolved statically via Server Component in `app/page.tsx`. Renders `<HeroSection />`, `<SkillsTicker />`, `<ServicesPreview />`, `<HomeFeaturedProjects />`, `<GitHubActivitySection />`, `<FeedbackSection />`, `<ContactSection />`. | `app/page.tsx:93-128` |
| **2. Projects directory registration** | Registered at `/projects` via `app/projects/page.tsx`. Wraps `<ProjectsSection />` in `<Suspense>` and loads `<ModernProjectsList />`. | `app/projects/page.tsx:106-125` |
| **3. How individual project details are opened** | Project cards render standard Next.js `<Link href={'/projects/${project.id}'}>` wrapping both the card title and cover image. Clicking pushes a route onto browser history and navigates to the dedicated project page. | `components/projects/cards/project-card-gsap.tsx:282, 448` |
| **4. Dynamic route architecture** | Uses Next.js dynamic segment `[id]` at `app/projects/[id]/page.tsx`. In Next.js 15, `params` is an asynchronous Promise: `params: Promise<{ id: string }>`. It fetches the document from Firestore via `getProjectById(id)`. If document is missing, it triggers `notFound()`. | `app/projects/[id]/page.tsx:8-12, 128-135` |
| **5. Navigation state maintenance** | Top navigation bar is client-side (`components/ui/navigation.tsx`). Reads current path with `usePathname()`. Tracks scroll direction (`up`/`down`) to hide on downward scroll and reveal on upward scroll. Keeps mobile menu state in local React state. | `components/ui/navigation.tsx:21-85` |
| **6. Browser history & transitions** | Standard HTML5 `window.history.pushState` handled by Next.js router (`useRouter()`, `<Link>`). Forward/back navigation triggers standard popstate events. Wrapped by `app/template.tsx` motion transitions. | `app/template.tsx`, `components/projects/modern-projects-list.tsx:5` |
| **7. Direct URL access** | Fully supported on all routes. Because it runs as a Node.js SSR/ISR server on Railway, hitting `https://al-edrisy.up.railway.app/projects/XYZ` directly executes the Server Component, generates metadata, and serves complete HTML. | `app/projects/[id]/page.tsx:15-126` |
| **8. Page refreshes on nested routes** | Hitting browser refresh (`F5` / `Cmd+R`) on `/projects/[id]` re-executes `generateMetadata` and `ProjectPage`, seamlessly hydrating the client component without 404 or routing mismatch. | Verified via SSR architecture |
| **9. External project links handling** | Live demos (`project.link`) and source code (`project.github`) open in a new tab using `target="_blank" rel="noopener noreferrer"`. Links are auto-prefixed with `https://` if protocol is missing. | `components/projects/project-page-client.tsx:590-609` |
| **10. Route conflicts** | Currently **zero route conflicts**. `/projects/create` is placed alongside `[id]`. Next.js static segment precedence ensures `/projects/create` matches before `[id]` can capture `create` as an ID. | Next.js file-system routing priority |

---

## 2. Brand Experience Route Architecture Assessment

The assignment requires an optional, dedicated, single-page scrolling Brand Experience for individual brands (e.g., Pronto.Eats, 7A, Ispani, Akakus).

We evaluated three potential route patterns:

### Option A: Nested under Projects (`/projects/[id]/experience`)
- **Pattern:** `app/projects/[id]/experience/page.tsx`
- **Pros:** Inherits project ID directly; logical heir to existing project details.
- **Cons:** 
  1. Uses internal database IDs (e.g., `/projects/abc123xyz/experience`) rather than memorable brand slugs (`/experiences/pronto`).
  2. Conceptually violates the product identity requirement: a brand experience should feel like an independent digital showcase, not a sub-tab of a portfolio case study.
  3. Inherits `app/projects/layout.tsx` (though currently empty, any future project-level wrapper would bind it).

### Option B: Parallel Slugs under Experiences (`/experiences/[slug]`) — **RECOMMENDED**
- **Pattern:** `app/experiences/[slug]/page.tsx`
- **Example URLs:**
  - `https://al-edrisy.up.railway.app/experiences/pronto`
  - `https://al-edrisy.up.railway.app/experiences/7a`
  - `https://al-edrisy.up.railway.app/experiences/ispani`
  - `https://al-edrisy.up.railway.app/experiences/akakus`
- **Pros:**
  1. **Clean, premium URLs:** Matches real-world brand showcases and marketing URLs.
  2. **Direct access & shareability:** Allows direct linking to the brand experience in emails, pitches, or social media without exposing internal database IDs.
  3. **Complete isolation:** Lives in its own route tree (`app/experiences/`), guaranteeing zero chance of collision with `/projects/[id]`.
  4. **Dynamic routing with static fallback:** Can load configuration from a static brand registry (instant SSR, zero DB overhead) or fall back to Firestore if a dynamic brand document exists.
- **Cons:** Requires mapping project entries to brand experience slugs (which `Project.slug` or `Project.brandExperience.slug` already conceptually enables).

### Option C: Isolated Route Group (`app/(brand-experiences)/[brand]/page.tsx`)
- **Pattern:** Root-level URLs (e.g. `/pronto`, `/7a`)
- **Evaluation:** High risk of collision with future portfolio pages (e.g. `/services`, `/resume`, `/pricing`). **Rejected** to avoid namespace pollution.

---

## 3. Brand Experience Navigation & User Journey Integration

To respect the **Critical Requirement: Zero Regression**, the existing user journey remains untouched while providing seamless, intuitive entry into the new experience:

```
┌─────────────────────────────────────────────────────────────────┐
│ EXISTING USER JOURNEY (UNCHANGED)                               │
│                                                                 │
│ Home Page                                                       │
│    │                                                            │
│    ▼                                                            │
│ Projects Directory (/projects)                                  │
│    │                                                            │
│    ▼                                                            │
│ Project Card                                                    │
│    │                                                            │
│    ▼                                                            │
│ Project Details (/projects/[id])                                │
│    ├── Overview (Cover, Gallery, Video, Docs)                   │
│    ├── Technical Info & Categories                              │
│    ├── External Links (Live Demo, GitHub)                       │
│    └── Reactions & Community Discussion                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ If brandExperience.enabled === true
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ NEW OPTIONAL BRAND EXPERIENCE JOURNEY                           │
│                                                                 │
│ [ Explore Brand Experience ] Button in Action Sidebar           │
│    │                                                            │
│    ▼                                                            │
│ Dedicated Single-Page Experience (/experiences/[slug])         │
│    ├── Sticky Minimal Brand Header (Back to Portfolio + Nav)    │
│    ├── Full-Screen Hero (Cinematic typography, video/poster)    │
│    ├── Brand Story & Philosophy                                 │
│    ├── Interactive Product Showcase (Interactive UI mockup)     │
│    ├── Visual Identity & Design System Tokens                   │
│    ├── Key Features & Capability Matrix                         │
│    ├── Engineering & Technical Architecture                     │
│    └── Closing Call to Action & Return to Portfolio             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 Seamless Entry Points
1. **Primary Entry Point:** Inside `components/projects/project-page-client.tsx` (lines 586-613, the sticky action buttons column). When a project has a configured brand experience, a high-contrast, tactile button appears above "Live Demo":
   ```tsx
   <Button asChild size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 ...">
     <Link href={`/experiences/${project.brandExperience.slug}`}>
       <Sparkles className="h-4 w-4 mr-2" />
       Explore Brand Experience
     </Link>
   </Button>
   ```
2. **Secondary Entry Point (Project Card):** In `components/projects/cards/project-card-gsap.tsx`, an optional pill badge or action button can sit alongside "View Details", allowing direct exploration from the project directory.

### 3.2 Return Navigation & Context Preservation
A critical UX flaw in external showcases is stranding the visitor. The Brand Experience header will feature:
- A persistent "Back to Portfolio" / "View Project Case Study" button pointing directly back to `/projects/[id]` or `/projects`.
- Deep-linking anchor navigation for smooth in-page scrolling (`#story`, `#showcase`, `#identity`, `#engineering`).
- Independent brand styling: The header belongs entirely to the showcased brand, not the portfolio navigation bar.

---

## 4. 404 & Fallback Strategy

When a visitor navigates directly to `/experiences/invalid-slug`:
1. The route handler checks the brand registry.
2. If invalid, it invokes Next.js `notFound()`.
3. An experience-specific `not-found.tsx` (`app/experiences/not-found.tsx`) renders a branded recovery screen with a direct link back to `/projects`.
4. Page refreshes and direct URLs function out of the box because `/experiences/[slug]` is a native Server Component in the Next.js App Router.
