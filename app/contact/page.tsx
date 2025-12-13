import { Suspense } from "react"
import { Metadata } from "next"
import ContactSection from "@/components/sections/contact-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Contact Salih Ben Otman - Hire Full Stack Developer",
  description: "Get in touch with Salih Ben Otman for software development projects, collaboration opportunities, freelance work, or consulting services. Available for full-stack development, React/Next.js projects, AI integrations, UI/UX design, and web application development. Contact via email: salehfree33@gmail.com or phone: +218 92 152 70 18. Let's discuss your next digital solution.",
  keywords: "Contact Software Developer, Hire Full Stack Developer, Contact Salih Ben Otman, Freelance Developer, Software Development Services, Collaboration Opportunity, Project Inquiry, Hire React Developer, Hire Next.js Developer, Web Development Consultation, Software Engineer Contact",
  openGraph: {
    title: "Contact Salih Ben Otman - Hire Full Stack Developer",
    description: "Available for software development projects, collaboration, and consulting. Expert in React, Next.js, TypeScript, and AI integrations.",
    url: "https://salihbenotman.dev/contact",
    type: "website",
  },
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading contact form...</p>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
            <ContactSection />
          </Suspense>
        </div>
      </main>
    </ErrorBoundary>
  )
}

