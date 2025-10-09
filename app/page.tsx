import { Suspense } from "react"
import { Metadata } from "next"
import HeroSection from "@/components/sections/hero-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import AnimatedCards from "@/components/ui/animated-cards"

export const metadata: Metadata = {
  title: "Salih Ben Otman - UI/UX Engineer & AI Systems Builder",
  description: "Portfolio of Salih Ben Otman, a UI/UX Engineer and AI Systems Builder with 5+ years of experience in full-stack development, AI integrations, and modern web technologies.",
  keywords: "UI/UX Engineer, AI Systems Builder, Full-Stack Developer, React, Next.js, OpenAI, Langflow, TypeScript",
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading amazing content...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <Navigation />
        <Suspense fallback={<LoadingFallback />}>
          <HeroSection />
          <AnimatedCards />
        </Suspense>
      </main>
    </ErrorBoundary>
  )
}
