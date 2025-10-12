import { Suspense } from "react"
import { Metadata } from "next"
import SkillsSection from "@/components/sections/skills-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Technical Skills & Expertise - Al-Edrisy (Salih Ben Otman)",
  description: "Comprehensive overview of Al-Edrisy's (Salih Ben Otman) technical skills and expertise. Proficient in React, Next.js, TypeScript, JavaScript, Node.js, Express.js, HTML5, CSS3, Tailwind CSS, Firebase, MongoDB, PostgreSQL, Git, AI integrations (OpenAI, Langflow), RESTful APIs, responsive design, system architecture, and modern web development best practices. 15+ technologies mastered.",
  keywords: "Technical Skills, Programming Languages, React Skills, Next.js Expertise, TypeScript, JavaScript, Node.js, Frontend Development Skills, Backend Development, Database Skills, MongoDB, PostgreSQL, Firebase, Git, GitHub, AI Integration, OpenAI, Web Development Skills, Full Stack Skills, UI/UX Skills, Modern Web Technologies, Software Engineering Skills",
  openGraph: {
    title: "Technical Skills & Expertise - Al-Edrisy (Salih Ben Otman)",
    description: "Expert in React, Next.js, TypeScript, Node.js, AI integrations, and 15+ modern web technologies. Professional full-stack development skills.",
    url: "https://salihbenotman.dev/skills",
    type: "website",
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

