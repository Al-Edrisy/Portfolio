import { Suspense } from "react"
import { Metadata } from "next"
import SkillsSection from "@/components/sections/skills-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Skills - Salih Ben Otman",
  description: "Discover Salih Ben Otman's technical skills and expertise in modern web technologies, AI integrations, and full-stack development.",
  keywords: "Skills, Technical Expertise, React, Next.js, TypeScript, AI, Machine Learning, Full-Stack Development",
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

