import { Suspense } from "react"
import { Metadata } from "next"
import ProjectsSection from "@/components/sections/projects-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
// Custom cursor removed - using default browser cursor
import { FeedbackTrigger } from "@/components/feedback"

export const metadata: Metadata = {
  title: "Projects Portfolio - Al-Edrisy (Salih Ben Otman) | 50+ Completed Projects",
  description: "Explore Al-Edrisy's (Salih Ben Otman) portfolio of 50+ completed software development projects. Featuring AI chatbots, analytics dashboards, collaborative design tools, CMS platforms, banking apps, e-commerce solutions, and modern web applications. Built with React, Next.js, TypeScript, Node.js, and AI integrations. Professional showcase of full-stack development expertise.",
  keywords: "Software Development Projects, Portfolio Projects, AI Chatbot Development, Analytics Dashboard, SaaS Applications, E-commerce Development, Banking App, CMS Development, React Projects, Next.js Applications, TypeScript Projects, Full Stack Projects, Web Application Development, UI/UX Design Portfolio, Modern Web Development",
  openGraph: {
    title: "Projects Portfolio - Al-Edrisy (Salih Ben Otman) | 50+ Completed Projects",
    description: "Explore 50+ professional software development projects: AI chatbots, dashboards, design tools, CMS, banking apps, and e-commerce solutions built with React, Next.js, and TypeScript.",
    url: "https://salihbenotman.dev/projects",
    type: "website",
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

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <ProjectsSection />
          </Suspense>
        </div>
        {/* Feedback drawer trigger - shows when user scrolls 70% of page */}
        <FeedbackTrigger triggerScrollPercentage={70} />
      </main>
    </ErrorBoundary>
  )
}

