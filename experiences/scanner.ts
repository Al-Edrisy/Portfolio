import fs from 'fs'
import path from 'path'

export interface DiscoveredBrand {
  slug: string
  name: string
  tagline: string
  description: string
  accentColor: string
  category: string
  filePath: string
}

const BRANDS_DIR = path.join(process.cwd(), 'experiences', 'brands')

// Fallback metadata for known brands if not explicitly exported in the file
const BRAND_METADATA_FALLBACKS: Record<string, Partial<DiscoveredBrand>> = {
  sample: {
    name: 'Sample Brand Experience',
    tagline: 'Interactive Product Showcase & Architectural Blueprint',
    description: 'A reference blueprint demonstrating full-screen video heroes, interactive widgets, GSAP scroll choreography, and Cloudflare media integration.',
    accentColor: '#3B82F6',
    category: 'Reference Blueprint / Interactive Showcase',
  },
  pronto: {
    name: 'Pronto.Eats',
    tagline: 'Hyper-Fast Culinary Logistics & Instant Food Delivery',
    description: 'An end-to-end interactive digital product experience exploring ultra-responsive food delivery, kitchen dispatch telemetry, and micro-interactions.',
    accentColor: '#FF4757',
    category: 'Culinary Logistics / Mobile App',
  },
  'seven-a': {
    name: '7A Hospitality',
    tagline: 'Sanctuary of Modern Architectural Luxury',
    description: 'A bespoke digital experience showcasing high-touch boutique hospitality, suite reservation flows, and architectural stillness.',
    accentColor: '#C5A880',
    category: 'Luxury Hospitality / Boutique Stays',
  },
  ispani: {
    name: 'Ispani Athletics',
    tagline: 'Precision Sportswear & Performance Telemetry',
    description: 'High-octane technical activewear presentation featuring live motion tracking and athletic telemetry.',
    accentColor: '#10B981',
    category: 'Activewear / Telemetry',
  },
  akakus: {
    name: 'Akakus',
    tagline: 'Desert Monolith Architectural System',
    description: 'Architectural structural canvas inspired by prehistoric formations, earth tones, and timeless minimalism.',
    accentColor: '#F59E0B',
    category: 'Architectural System / Spatial Design',
  },
}

/**
 * Normalizes a brand name from a slug (e.g. 'seven-a' -> 'Seven A', 'pronto' -> 'Pronto')
 */
function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Scans the experiences/brands/ directory on the server and returns all valid brand slugs.
 */
export function getAllBrands(): DiscoveredBrand[] {
  if (!fs.existsSync(BRANDS_DIR)) {
    return []
  }

  const entries = fs.readdirSync(BRANDS_DIR, { withFileTypes: true })
  const brands: DiscoveredBrand[] = []

  for (const entry of entries) {
    let slug = ''
    let fullPath = ''

    if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      slug = entry.name.replace(/\.(tsx|jsx)$/, '')
      fullPath = path.join(BRANDS_DIR, entry.name)
    } else if (entry.isDirectory()) {
      const indexPath = path.join(BRANDS_DIR, entry.name, 'index.tsx')
      const pagePath = path.join(BRANDS_DIR, entry.name, 'page.tsx')
      if (fs.existsSync(indexPath)) {
        slug = entry.name
        fullPath = indexPath
      } else if (fs.existsSync(pagePath)) {
        slug = entry.name
        fullPath = pagePath
      }
    }

    // Skip hidden files, system files, or test files
    if (!slug || slug.startsWith('.') || slug.startsWith('_') || slug.includes('.test.')) {
      continue
    }

    const fallback = BRAND_METADATA_FALLBACKS[slug] || {}

    brands.push({
      slug,
      name: fallback.name || titleCaseFromSlug(slug),
      tagline: fallback.tagline || 'Interactive Digital Product & Brand Showcase',
      description: fallback.description || `Explore the interactive brand experience and architecture for ${titleCaseFromSlug(slug)}.`,
      accentColor: fallback.accentColor || '#3B82F6',
      category: fallback.category || 'Digital Product Showcase',
      filePath: fullPath,
    })
  }

  return brands
}

/**
 * Returns metadata for a specific brand slug if it exists in the filesystem.
 */
export function getBrandBySlug(slug: string): DiscoveredBrand | null {
  const brands = getAllBrands()
  return brands.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || null
}

/**
 * Fast check to see if a brand slug exists in the filesystem.
 */
export function hasBrand(slug: string): boolean {
  return getBrandBySlug(slug) !== null
}
