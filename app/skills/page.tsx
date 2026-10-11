import { Suspense } from "react"
import { Metadata } from "next"
import SkillsSection from "@/components/sections/skills-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Technical Skills & Architecture Stack - Salih Ben Otman",
  description: "Comprehensive breakdown of Salih Ben Otman's technical engineering proficiencies: React 19, Next.js 15, TypeScript, Node.js, Cloud Firestore, PostgreSQL, AI Agent Integrations, and Responsive UI Engineering.",
  keywords: [
    "Technical Skills",
    "Programming Languages",
    "React Specialist",
    "Next.js Architecture",
    "TypeScript",
    "Node.js Backend",
    "Firestore Database",
    "PostgreSQL",
    "AI Systems Builder",
    "LangChain",
    "Salih Ben Otman",
  ],
  alternates: {
    canonical: "https://salihbenotman.dev/skills",
  },
  openGraph: {
    title: "Technical Skills & Architecture Stack - Salih Ben Otman",
    description: "Expert in React 19, Next.js 15, TypeScript, Node.js, AI integrations, and modern cloud databases.",
    url: "https://salihbenotman.dev/skills",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salih Ben Otman - Technical Skills & Architecture Stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Skills & Architecture Stack - Salih Ben Otman",
    description: "Mastery across React, Next.js, TypeScript, Node.js, and AI integrations.",
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
        <p className="text-muted-foreground mt-4">Loading skills...</p>
      </div>
    </div>
  )
}

export default function SkillsPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <SkillsSection />
          </Suspense>
        </div>
      </main>
    </ErrorBoundary>
  )
}
