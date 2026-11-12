import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBrands } from '@/experiences/scanner'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import ErrorBoundary from '@/components/ui/error-boundary'
import { Sparkles, ArrowRight, Layers, Terminal, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Brand Experiences Lab — Salih Ben Otman',
  description:
    'Dedicated interactive product showcases and brand design systems. Explore full-screen digital experiences, bespoke UI interactions, and Cloudflare-accelerated media architectures.',
  alternates: {
    canonical: 'https://salihbenotman.dev/experiences',
  },
  openGraph: {
    title: 'Brand Experiences Showcase — Salih Ben Otman',
    description: 'Bespoke interactive digital product experiences and independent brand design systems.',
    url: 'https://salihbenotman.dev/experiences',
    type: 'website',
  },
}

export default function ExperiencesDirectoryPage() {
  const brands = getAllBrands()

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />

        <div className="flex-1 pt-28 pb-20">
          <div className="container mx-auto px-6 max-w-6xl space-y-12">
            
            {/* Header Section */}
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Compass className="w-3.5 h-3.5" />
                <span>Product Lab & Visual Systems</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
                Brand <span className="text-primary">Experiences</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
                Dedicated, immersive digital product presentations. Instead of traditional case studies,
                each experience immerses you into the independent brand identity, interactive workflows, and
                motion design built for the product.
              </p>
            </div>

            {/* Brands Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {brands.map((brand) => (
                <div
                  key={brand.slug}
                  className="group relative rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 p-7 flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header Row: Category badge & accent indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                        {brand.category}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: brand.accentColor }}
                        />
                        <span>/experiences/{brand.slug}</span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {brand.name}
                      </h2>
                      <p className="text-sm font-medium text-muted-foreground mt-1">
                        {brand.tagline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      {brand.description}
                    </p>
                  </div>

                  {/* Launch CTA Button */}
                  <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                    <Link href={`/experiences/${brand.slug}`} className="w-full">
                      <Button className="w-full justify-between rounded-xl group/btn" size="lg">
                        <span>Launch Experience</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Open Canvas Scaffolding Banner */}
            <div className="p-8 rounded-2xl bg-muted/40 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Open-Canvas Architecture</span>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Want to add a new brand? Simply drop any React JSX file (e.g.{' '}
                  <code className="text-primary font-mono">pronto.tsx</code> or{' '}
                  <code className="text-primary font-mono">seven-a.tsx</code>) into the{' '}
                  <code className="text-primary font-mono">experiences/brands/</code> directory.
                  It will automatically appear here and mount its direct URL with zero database setup.
                </p>
              </div>

              <Link href="/experiences/sample">
                <Button variant="outline" size="sm" className="shrink-0 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                  <span>Inspect Reference Sample</span>
                </Button>
              </Link>
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}
