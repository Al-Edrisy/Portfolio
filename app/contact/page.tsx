import { Suspense } from "react"
import { Metadata } from "next"
import ContactSection from "@/components/sections/contact-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Contact & Engineering Inquiries - Salih Ben Otman",
  description: "Get in touch with Salih Ben Otman for full-stack engineering, contract projects, React/Next.js architectures, or AI system integrations. Reachable via email: salehfree33@gmail.com, phone: +218 92 152 70 18, or direct contact form.",
  keywords: [
    "Contact Salih Ben Otman",
    "Hire Full Stack Developer",
    "Software Development Inquiries",
    "Freelance React Developer",
    "Next.js Consultant",
    "AI Systems Engineer Hire",
  ],
  alternates: {
    canonical: "https://salihbenotman.dev/contact",
  },
  openGraph: {
    title: "Contact & Engineering Inquiries - Salih Ben Otman",
    description: "Available for high-impact software engineering contracts, collaboration, and consulting.",
    url: "https://salihbenotman.dev/contact",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Salih Ben Otman - Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Salih Ben Otman - Full Stack Developer",
    description: "Available for full stack web development and AI systems engineering.",
    creator: "@salihbenotman",
    images: ["/og-image.png"],
  },
  other: {
    "llms-txt": "https://salihbenotman.dev/llms.txt",
    "llms-full-txt": "https://salihbenotman.dev/llms-full.txt",
  },
}

const contactJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://salihbenotman.dev/contact#contactpage",
      "url": "https://salihbenotman.dev/contact",
      "name": "Contact Salih Ben Otman",
      "mainEntity": {
        "@type": "Person",
        "@id": "https://salihbenotman.dev/#person",
        "name": "Salih Ben Otman",
        "email": "salehfree33@gmail.com",
        "telephone": "+218 92 152 70 18"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://salihbenotman.dev/contact#breadcrumb",
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
          "name": "Contact",
          "item": "https://salihbenotman.dev/contact"
        }
      ]
    }
  ]
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading contact form...</p>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <ContactSection />
          </Suspense>
        </div>
      </main>
    </ErrorBoundary>
  )
}
