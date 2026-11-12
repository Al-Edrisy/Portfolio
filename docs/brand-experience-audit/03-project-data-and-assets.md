# 03 — Project Data & Asset Architecture Audit

> **Audit Stamped:** 2026-11-12  
> **Target Application:** Al-Edrisy Personal Engineering Portfolio  
> **Production URL:** [https://al-edrisy.up.railway.app](https://al-edrisy.up.railway.app)  
> **Scope:** Data Model, Firestore Schemas, Media Asset Storage, R2 Integration, and Schema Extension Strategy

---

## 1. Existing Project Data Storage & Schema Audit

Project data is stored in **Google Cloud Firestore** under the primary collection `projects`. A secondary centralized collection `media_assets` stores metadata for uploaded media files.

### 1.1 Existing Type Definitions

In `types/index.ts` (lines 55-95), the `Project` interface is defined as:

```typescript
export interface Project {
  id: string
  title: string
  slug?: string
  description: string
  longDescription?: string
  challenges?: string
  solutions?: string
  results?: string
  features?: string[]
  thumbnailMediaId?: string
  thumbnail?: MediaAsset
  galleryMediaIds?: string[]
  gallery?: MediaAsset[]
  videoMediaId?: string
  video?: MediaAsset
  image?: string             // Legacy field - kept for backward compatibility
  images?: string[]          // Array of image URLs - first is cover, rest are gallery
  videoUrl?: string          // Video URL (YouTube, Vimeo, LinkedIn, X, or direct)
  tech: string[]
  categories: ProjectCategory[]
  category?: ProjectCategory // Deprecated: Keep for backward compatibility
  link: string               // External live demo URL
  github: string             // GitHub repository URL
  createdAt: Date
  updatedAt: Date
  published: boolean
  featured?: boolean
  authorId: string
  authorName: string
  authorAvatar?: string
  reactionsCount: Record<ReactionType, number>
  commentsCount: number
  viewsCount?: number
  sharesCount?: number
  documents?: { name: string; url: string; type: 'srs' | 'erd' | 'readme' | 'mermaid' | 'other' }[]
  documentsMediaIds?: string[]
  announcedAt?: Date | string | null
  announcementCampaignId?: string | null
  announcementRecipientCount?: number
}
```

### 1.2 Data Loading Methodology

1. **Server-Side Rendering (SSR) on Route Load:**
   - On `/projects/[id]`, the Server Component calls `getProjectById(id)` (`lib/firebase/utils/firebase-utils.ts:313`).
   - Resolves Firestore document snapshot into `Project` model, joins reactions count and comments count, and resolves media IDs via `resolveProjectMedia()`.
2. **Client-Side Real-Time Hydration:**
   - In `components/projects/modern-projects-list.tsx`, `useProjects()` uses paginated Firestore queries (`PROJECTS_PER_PAGE = 10`) with infinite scroll via an `IntersectionObserver`.
   - On single project pages, `useProject(projectId)` (`hooks/projects/data/use-projects.ts:189`) provides reactive state.
3. **Static Fallback & Resiliency:**
   - Fallback error boundaries and loading skeletons (`components/ui/loading-skeleton.tsx`) are already implemented.

---

## 2. Asset & Media Pipeline Audit

The portfolio already possesses a sophisticated, enterprise-ready media storage architecture backed by **Cloudflare R2**:

```
┌────────────────────────────────────────────────────────┐
│ Client (Browser)                                       │
│   • Admin Upload Modal: enhanced-project-form.tsx      │
│   • Video Player: project-video-player.tsx             │
│   • Image Gallery: image-gallery.tsx                   │
└───────────────────────────┬────────────────────────────┘
                            │
            POST /api/upload (Base64 file buffer + MIME)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Next.js Server Handler (app/api/upload/route.ts)       │
│   1. requireAdmin(request) authorization               │
│   2. Size validation (<= 100MB video, <= 25MB others)  │
│   3. MIME whitelist (JPEG, PNG, WebP, SVG, MP4, etc.)  │
│   4. MediaService.uploadMedia()                        │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│ Cloudflare R2 Storage     │ │ Cloud Firestore          │
│   • S3 PutObjectCommand   │ │   • Collection:          │
│   • Bucket: salih-otman-  │ │     media_assets         │
│     portfolio             │ │   • ID, dimensions, size │
│   • Public or Proxy URL   │ │   • MIME type, alt text  │
└─────────────┬─────────────┘ └──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│ Asset Delivery: Next.js Streaming Proxy                │
│   • Route: /api/media/[...key]                         │
│   • Byte-range streaming for MP4 / WebM video          │
│   • Cache-Control: public, max-age=31536000, immutable │
│   • Direct CDN bypass if R2_PUBLIC_DOMAIN is configured│
└────────────────────────────────────────────────────────┘
```

### 2.1 Media Reference Patterns in Existing Projects
- **Images:** Stored both as legacy raw URLs in `images[]` (first item = cover, remaining = gallery) and as modern normalized `thumbnailMediaId` / `galleryMediaIds` linked to Firestore `media_assets`.
- **Videos:** Stored as `videoUrl` (supporting direct MP4/WebM files on R2 or external embeds from YouTube/Vimeo/LinkedIn) or `videoMediaId` pointing to an uploaded video object in R2.
- **External URLs:** Cleanly segregated into `link` (live product) and `github` (source code).

---

## 3. Extending the Schema for Brand Experience (Zero Regression)

To introduce the Brand Experience without breaking existing projects or necessitating a database migration, we define an optional, additive property on the `Project` interface:

```typescript
export interface BrandExperienceConfig {
  enabled: boolean
  slug: string                      // e.g., 'pronto', '7a', 'ispani', 'akakus'
  customDomain?: string             // Optional future custom domain (e.g. pronto.eats)
  tagline?: string                  // Punchy brand hero tagline
  themeId?: string                  // Key identifying custom theme token set
  accentColor?: string              // Primary accent color for UI highlights
  navigation?: {
    brandName: string
    logoUrl?: string
    backUrl?: string                // Defaults to /projects/[id]
  }
}

// Additive extension to types/index.ts
export interface Project {
  // ... all existing fields remain 100% untouched
  brandExperience?: BrandExperienceConfig
}
```

### 3.1 Why This Extension Is 100% Safe:
1. **TypeScript Optionality (`?`):** Existing project entries in Firestore do not possess this field. In TypeScript and Firestore, missing fields simply resolve to `undefined`.
2. **Zero Migration Required:** We do **not** need to run batch scripts over the existing database to add `brandExperience: null`.
3. **Graceful Fallback:** If `project.brandExperience?.enabled` is not truthy, the "Explore Brand Experience" button simply does not render, preserving the exact current UI.

---

## 4. Asset Management & Workflow Proposal

The assignment poses an important question: *How should brand assets be organized and managed without building an unnecessary CMS or complex backend?*

### 4.1 Hybrid Architecture: Static Brand Manifest + R2 Storage

Rather than building a heavy CMS with database tables and dynamic forms for every single brand layout, we recommend a **Code-as-Configuration Brand Manifest system backed by Cloudflare R2**:

```
brand-assets/ (Hosted on Cloudflare R2 bucket: salih-otman-portfolio)
│
├── pronto/
│   ├── logo/
│   │   ├── logo.svg
│   │   └── wordmark.svg
│   ├── images/
│   │   ├── hero-mockup.webp
│   │   ├── dish-feature-1.webp
│   │   └── ordering-flow.webp
│   ├── videos/
│   │   └── mobile-checkout-interaction.mp4
│   └── fonts/ (Optional custom brand webfonts)
│       └── PlusJakartaSans-Bold.woff2
│
├── seven-a/
│   ├── logo/
│   ├── images/
│   └── videos/
│
└── ispani/
    ├── logo/
    ├── images/
    └── videos/
```

### 4.2 Brand Configuration File Structure
In the application source code, each brand is defined in a strongly-typed TypeScript configuration file:

```
experiences/
├── configurations/
│   ├── index.ts                   // Unified brand registry
│   ├── pronto.config.ts           // Pronto.Eats brand identity & sections
│   ├── seven-a.config.ts          // 7A brand identity & sections
│   ├── ispani.config.ts           // Ispani brand identity & sections
│   └── akakus.config.ts           // Akakus brand identity & sections
```

### 4.3 Why Static Manifest Is Superior for a Personal Portfolio:
1. **Type Safety & Intellisense:** Every section, image path, video asset, color code, and feature bullet point is validated at compile time by TypeScript. Typos in asset paths trigger build errors rather than silent 404s.
2. **Zero Database Latency:** The brand presentation renders instantaneously via Next.js Server Components without querying multiple Firestore collections.
3. **Version Controlled with Git:** Brand copy, typography choices, and layout ordering are version-controlled alongside code commits.
4. **Leverages Existing R2 Pipeline:** New assets (videos, high-res WebP images) can be uploaded using the existing `scripts/upload-video-r2.mjs` script or via the existing `/api/upload` endpoint in the admin dashboard, returning an immediate R2 key or public URL to paste into the brand's config file.
5. **Previewing Changes:** Developers can test changes locally on `npm run dev` with instant Hot Module Replacement (HMR) before deploying.
