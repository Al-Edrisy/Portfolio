import { Suspense } from "react"
import { Metadata } from "next"
import AboutSection from "@/components/sections/about-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"

// Calculate years of experience dynamically from 2020
const calculateYearsOfExperience = (): number => {
  const startYear = 2020
  const currentYear = new Date().getFullYear()
  return currentYear - startYear
}

const yearsOfExperience = calculateYearsOfExperience()

export const metadata: Metadata = {
  title: "About Salih Ben Otman - Engineering Practice, Background & Architecture",
  description: `The Engineering Practice of Salih Ben Otman (Al-Edrisy): Full Stack Software Developer, UI/UX Engineer, and AI Systems Builder with ${yearsOfExperience}+ years experience. B.Sc. in Software Engineering from Final International University. Architecting high-speed Next.js systems, autonomous AI agents, and tactile digital experiences.`,
  keywords: [
    "About Salih Ben Otman",
    "Salih Ben Otman Engineering Practice",
    "Al-Edrisy",
    "Full Stack Software Developer",
    "UI/UX Engineer",
    "AI Systems Builder",
    "Final International University Software Engineering",
    "FIU Kyrenia",
    "Next.js Architect",
    "Langflow and LangChain Developer",
    "Clean Architecture TypeScript",
  ],
  alternates: {
    canonical: "https://salihbenotman.dev/about",
  },
  openGraph: {
    title: "About Salih Ben Otman - Engineering Practice & Background",
    description: `Full Stack Developer & AI Systems Engineer with ${yearsOfExperience}+ years experience. B.Sc. in Software Engineering from Final International University.`,
    url: "https://salihbenotman.dev/about",
    type: "profile",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About Salih Ben Otman - Engineering Practice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Salih Ben Otman - Full Stack & AI Systems Engineer",
    description: `Full Stack Developer with ${yearsOfExperience}+ years experience, B.Sc. in Software Engineering from FIU.`,
    creator: "@salihbenotman",
    images: ["/og-image.png"],
  },
  other: {
    "citation_author": "Salih Ben Otman",
    "citation_title": "Salih Ben Otman - Academic & Professional Engineering Background",
    "citation_institution": "Final International University",
    "citation_pdf_url": "https://salihbenotman.dev/cv/salih.otman@final.edu.tr.pdf",
    "llms-txt": "https://salihbenotman.dev/llms.txt",
    "llms-full-txt": "https://salihbenotman.dev/llms-full.txt",
  },
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://salihbenotman.dev/about#aboutpage",
      "url": "https://salihbenotman.dev/about",
      "name": "About Salih Ben Otman",
      "mainEntity": {
        "@type": "Person",
        "@id": "https://salihbenotman.dev/#person",
        "name": "Salih Ben Otman",
        "alternateName": "Al-Edrisy",
        "jobTitle": "Full Stack Software Developer & AI Systems Builder",
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Final International University"
        },
        "sameAs": [
          "https://github.com/Al-Edrisy",
          "https://www.linkedin.com/in/صالح-بن-عثمان-a565a2242",
          "https://leetcode.com/u/salehfree33"
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://salihbenotman.dev/about#breadcrumb",
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
          "name": "About",
          "item": "https://salihbenotman.dev/about"
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
        <p className="text-muted-foreground mt-4 font-mono text-sm">Loading practice profile...</p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <main className="min-h-screen bg-background flex flex-col justify-between">
        <Navigation />
        <div className="pt-20 flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <AboutSection />
          </Suspense>
        </div>
        <Footer />
      </main>
    </ErrorBoundary>
  )
}
