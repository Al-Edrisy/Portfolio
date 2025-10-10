import { Suspense } from "react"
import { Metadata } from "next"
import ProjectsSection from "@/components/sections/projects-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import { CursorProvider, UserCursor } from "@/components/ui/custom-cursor"
import { FeedbackTrigger } from "@/components/feedback"

export const metadata: Metadata = {
  title: "Projects - Salih Ben Otman",
  description: "Explore Salih Ben Otman's portfolio of innovative digital solutions, AI integrations, and exceptional user experiences across various industries.",
  keywords: "Projects, Portfolio, AI Chatbot, Analytics Dashboard, Design Tools, CMS, Banking App, E-commerce",
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

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <CursorProvider>
        <main className="min-h-screen bg-background">
          <Navigation />
          <div className="pt-20">
            <Suspense fallback={<LoadingFallback />}>
              <ProjectsSection />
            </Suspense>
          </div>
          <UserCursor />
          {/* Feedback drawer trigger - shows when user scrolls 70% of page */}
          <FeedbackTrigger triggerScrollPercentage={70} />
        </main>
      </CursorProvider>
    </ErrorBoundary>
  )
}

