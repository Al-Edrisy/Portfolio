import { Suspense } from "react"
import { Metadata } from "next"
import AboutSection from "@/components/sections/about-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

// Calculate years of experience dynamically from 2020
const calculateYearsOfExperience = (): number => {
  const startYear = 2020
  const currentYear = new Date().getFullYear()
  return currentYear - startYear
}

const yearsOfExperience = calculateYearsOfExperience()

export const metadata: Metadata = {
  title: "About Salih Ben Otman - Professional Background & Experience",
  description: `Learn about Salih Ben Otman, a professional Full Stack Software Developer & UI/UX Engineer with ${yearsOfExperience}+ years experience. Bachelor of Science in Software Engineering from FIU. Expertise in React, Next.js, TypeScript, Node.js, AI integrations (OpenAI, Langflow), and modern web development. 50+ completed projects, certified in full-stack development and database mastery.`,
  keywords: "About Salih Ben Otman, Software Developer Background, Full Stack Developer Experience, UI/UX Engineer, FIU Software Engineering, Developer Education, Professional Certifications, React Expert, Next.js Specialist, TypeScript Developer, AI Integration Expert",
  openGraph: {
    title: "About Salih Ben Otman - Full Stack Software Developer",
    description: `Professional Full Stack Developer with ${yearsOfExperience}+ years experience, Bachelor of Science in Software Engineering, certified in full-stack development and database mastery.`,
    url: "https://salihbenotman.dev/about",
    type: "profile",
  },
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

