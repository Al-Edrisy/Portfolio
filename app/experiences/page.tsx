import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllBrands } from '@/experiences/scanner'
import { getBrandMediaUrl } from '@/experiences/shared/media-utils'
import { toAbsoluteUrl } from '@/lib/utils/site-url'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import ErrorBoundary from '@/components/ui/error-boundary'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Brand Experiences — Salih Ben Otman',
  description:
    'Dedicated interactive product showcases and brand design systems. Explore full-screen digital experiences, bespoke UI interactions, and Cloudflare-accelerated media.',
  alternates: {
    canonical: toAbsoluteUrl('/experiences'),
  },
  openGraph: {
    title: 'Brand Experiences — Salih Ben Otman',
    description: 'Bespoke interactive digital product experiences and independent brand design systems.',
    url: toAbsoluteUrl('/experiences'),
    siteName: 'Salih Ben Otman Portfolio',
    type: 'website',
    images: [
      {
        url: toAbsoluteUrl('/brands/akakus/hero-wordmark.webp'),
        width: 1200,
        height: 630,
        alt: 'Brand Experiences Showcase — Salih Ben Otman',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Experiences — Salih Ben Otman',
    description: 'Bespoke interactive digital product experiences and independent brand design systems.',
    creator: '@salihbenotman',
    images: [toAbsoluteUrl('/brands/akakus/hero-wordmark.webp')],
  },
}

const BRAND_PREVIEW_MEDIA: Record<string, { src: string; bg: string; alt: string }> = {
  akakus: {
    src: getBrandMediaUrl('akakus', 'hero-wordmark.webp'),
    bg: '#F9F5E4',
    alt: 'Akakus — Your ultimate partner in active living',
  },
}

export default function ExperiencesDirectoryPage() {
  const brands = getAllBrands()

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Navigation />

        <div className="flex-1 pt-32 pb-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            {/* Clean Editorial Header (no eyebrow/kicker) */}
            <header className="max-w-3xl border-b border-border/60 pb-12">
              <h1
                className="text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.08, textWrap: 'balance' }}
              >
                Brand Experiences
              </h1>
              <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
                Dedicated interactive worlds built for individual products. Each canvas steps
                outside standard case-study templates to let the typography, motion, and visual
                system speak directly.
              </p>
            </header>

            {/* Editorial Artifact-Led Showcase */}
            <section className="mt-14 space-y-20">
              {brands.length === 0 ? (
                <p className="py-12 text-base text-muted-foreground">
                  No brand experiences are currently published.
                </p>
              ) : (
                brands.map((brand) => {
                  const preview = BRAND_PREVIEW_MEDIA[brand.slug]
                  return (
                    <article
                      key={brand.slug}
                      className="group grid grid-cols-1 items-center gap-10 lg:grid-cols-12"
                    >
                      {/* Artifact Preview Frame */}
                      <Link
                        href={`/experiences/${brand.slug}`}
                        className="relative block overflow-hidden rounded-2xl lg:col-span-7"
                        style={{ backgroundColor: preview?.bg ?? '#141413' }}
                      >
                        {preview ? (
                          <Image
                            src={preview.src}
                            alt={preview.alt}
                            width={1024}
                            height={571}
                            priority
                            loading="eager"
                            className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div
                            className="flex aspect-[16/9] w-full items-center justify-center p-10"
                            style={{ backgroundColor: `${brand.accentColor}15` }}
                          >
                            <span
                              className="text-3xl font-semibold tracking-tight"
                              style={{ color: brand.accentColor }}
                            >
                              {brand.name}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Editorial Details */}
                      <div className="flex flex-col justify-center space-y-5 lg:col-span-5">
                        <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: brand.accentColor }}
                          />
                          <span>{brand.category}</span>
                        </div>

                        <div>
                          <h2
                            className="text-3xl font-semibold text-foreground sm:text-4xl"
                            style={{ letterSpacing: '-0.02em', lineHeight: 1.12 }}
                          >
                            <Link
                              href={`/experiences/${brand.slug}`}
                              className="transition-colors hover:text-primary"
                            >
                              {brand.name}
                            </Link>
                          </h2>
                          <p className="mt-2 text-base font-medium text-foreground/80">
                            {brand.tagline}
                          </p>
                        </div>

                        <p className="max-w-[55ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {brand.description}
                        </p>

                        <div className="pt-2">
                          <Button asChild size="lg" className="rounded-full px-6">
                            <Link href={`/experiences/${brand.slug}`}>
                              <span>Enter Experience</span>
                              <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </section>
          </div>
        </div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}
