import { Suspense } from "react"
import { Metadata } from "next"
import ProjectsSection from "@/components/sections/projects-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"
import { FeedbackTrigger } from "@/components/feedback"

export const metadata: Metadata = {
  title: "Software Projects Portfolio - Salih Ben Otman | Full Stack & AI Applications",
  description: "Explore Salih Ben Otman's portfolio of 50+ completed software engineering projects: AI systems, analytics dashboards, collaboration tools, e-commerce, and SaaS platforms built with React, Next.js, TypeScript, and Node.js.",
  keywords: [
    "Software Development Projects",
    "Portfolio Projects",
    "AI Systems Architecture",
    "Analytics Dashboards",
    "SaaS Applications",
    "React Projects",
    "Next.js Applications",
    "TypeScript Projects",
    "Full Stack Engineering",
    "Salih Ben Otman",
  ],
  alternates: {
    canonical: "https://salihbenotman.dev/projects",
  },
  openGraph: {
    title: "Software Projects Portfolio - Salih Ben Otman | Full Stack & AI Applications",
    description: "Explore 50+ professional software development projects: AI systems, dashboards, SaaS platforms, and modern web applications built with Next.js and TypeScript.",
    url: "https://salihbenotman.dev/projects",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salih Ben Otman - Software Projects Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Software Projects Portfolio - Salih Ben Otman",
    description: "Explore 50+ professional software development projects: AI systems, dashboards, SaaS platforms, and modern web applications.",
    creator: "@salihbenotman",
    images: ["/og-image.png"],
  },
  other: {
    "llms-txt": "https://salihbenotman.dev/llms.txt",
    "llms-full-txt": "https://salihbenotman.dev/llms-full.txt",
  },
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading projects...</p>
      </div>
    </div>
  )
}

const projectsCollectionJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://salihbenotman.dev/projects#collection",
      "url": "https://salihbenotman.dev/projects",
      "name": "Software Projects Portfolio - Salih Ben Otman",
      "description": "Directory of production-ready software engineering projects, AI applications, and web systems created by Salih Ben Otman.",
      "author": {
        "@type": "Person",
        "@id": "https://salihbenotman.dev/#person",
        "name": "Salih Ben Otman",
        "url": "https://salihbenotman.dev"
      },
      "isPartOf": {
        "@id": "https://salihbenotman.dev/#website"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://salihbenotman.dev/projects#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://salihbenotman.dev"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Projects",
          "item": "https://salihbenotman.dev/projects"
        }
      ]
    }
  ]
}

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsCollectionJsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <ProjectsSection />
          </Suspense>
        </div>
        {/* Non-intrusive floating feedback pill (reveals when user scrolls past 50%) */}
        <FeedbackTrigger triggerScrollPercentage={50} />
        <Footer />
      </main>
    </ErrorBoundary>
  )
}
