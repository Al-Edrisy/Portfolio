import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

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

/**
 * Dynamic brand loader: maps discovered brands to their dynamic JSX chunks.
 * You can drop any JSX/TSX file into experiences/brands/ and it works immediately.
 */
function getBrandComponent(slug: string) {
  return dynamic(
    () =>
      import(`@/experiences/brands/${slug}`).catch((err) => {
        console.error(`[Brand Experience] Could not load module for slug: "${slug}"`, err)
        return () => notFound()
      }),
    {
      ssr: true,
      loading: () => (
        <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-xs font-mono tracking-wider uppercase">Loading Brand Canvas...</p>
          </div>
        </div>
      ),
    }
  )
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params

  if (!hasBrand(slug)) {
    notFound()
  }

  const BrandComponent = getBrandComponent(slug)

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        }
      >
        <BrandComponent />
      </Suspense>
    </div>
  )
}
