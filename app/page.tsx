import { Suspense } from "react"
import { Metadata } from "next"
import HeroSection from "@/components/sections/hero-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import { FeedbackSection } from "@/components/feedback"
import { GitHubActivitySection } from "@/components/sections/github-activity-section"

export const metadata: Metadata = {
  title: "Home - Al-Edrisy (Salih Ben Otman) | Full Stack Software Developer Portfolio",
  description: "Welcome to Al-Edrisy's portfolio. Professional Full Stack Software Developer with 5+ years experience in React, Next.js, TypeScript, Node.js, and AI integrations. Explore 50+ completed projects, technical skills, and innovative digital solutions. Specializing in modern web development and scalable system architecture.",
  keywords: "Salih Ben Otman, Al-Edrisy, Software Developer Portfolio, Full Stack Developer, React Developer, Next.js Developer, TypeScript, UI/UX Engineer, Web Development, AI Integration, OpenAI, Modern Web Technologies",
  openGraph: {
    title: "Al-Edrisy (Salih Ben Otman) - Full Stack Software Developer Portfolio",
    description: "Professional Software Developer Portfolio - 5+ years experience in Full Stack Development, 50+ completed projects. Expert in React, Next.js, TypeScript, and AI integrations.",
    url: "https://salihbenotman.dev",
    type: "website",
  },
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
          <GitHubActivitySection />
          <FeedbackSection />
        </Suspense>
      </main>
    </ErrorBoundary>
  )
}
