import { Suspense } from "react"
import { Metadata } from "next"
import AboutSection from "@/components/sections/about-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "About - Salih Ben Otman",
  description: "Learn more about Salih Ben Otman, a UI/UX Engineer and AI Systems Builder with 5+ years of experience in full-stack development and AI integrations.",
  keywords: "About Salih Ben Otman, UI/UX Engineer, AI Systems Builder, Full-Stack Developer, Experience",
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading about section...</p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <AboutSection />
          </Suspense>
        </div>
      </main>
    </ErrorBoundary>
  )
}

