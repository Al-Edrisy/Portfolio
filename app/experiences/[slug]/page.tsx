import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'

interface ExperiencePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Statically pre-render known brand slugs at build time
 */
export async function generateStaticParams() {
  const brands = getAllBrands()
  return brands.map(brand => ({
    slug: brand.slug,
  }))
}

/**
 * Generate rich SEO and OpenGraph metadata per brand
 */
export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)

  if (!brand) {
    return {
      title: 'Brand Experience Not Found | Salih Ben Otman Portfolio',
      description: 'The requested interactive brand experience could not be found.',
    }
  }

  const title = `${brand.name} — Interactive Brand Experience`
  const description = `${brand.tagline} — ${brand.description}`
  const canonicalUrl = `https://salihbenotman.dev/experiences/${slug}`

  return {
    title,
    description,
    keywords: [
      brand.name,
      'Brand Experience',
      'Interactive Design',
      'Design Architecture',
      'Digital Product',
      'Salih Ben Otman',
      brand.category,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Salih Ben Otman Portfolio — Brand Experiences',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function ExperienceLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-xs font-mono tracking-wider uppercase text-slate-400">Loading Brand Canvas...</p>
      </div>
    </div>
  )
}

/**
 * Explicit registry of brand components ensuring 100% reliable chunk resolution
 */
const BRAND_COMPONENTS: Record<string, React.ComponentType<any>> = {
  sample: dynamic(() => import('@/experiences/brands/sample'), {
    ssr: true,
    loading: () => <ExperienceLoadingSkeleton />,
  }),
  pronto: dynamic(() => import('@/experiences/brands/sample'), {
    ssr: true,
    loading: () => <ExperienceLoadingSkeleton />,
  }),
  'seven-a': dynamic(() => import('@/experiences/brands/sample'), {
    ssr: true,
    loading: () => <ExperienceLoadingSkeleton />,
  }),
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params
  const normalizedSlug = slug.toLowerCase()

  if (!hasBrand(normalizedSlug)) {
    notFound()
  }

  const BrandComponent = BRAND_COMPONENTS[normalizedSlug]

  if (!BrandComponent) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ExperienceLoadingSkeleton />}>
        <BrandComponent />
      </Suspense>
    </div>
  )
}
