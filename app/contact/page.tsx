import { Suspense } from "react"
import { Metadata } from "next"
import ContactSection from "@/components/sections/contact-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"

export const metadata: Metadata = {
  title: "Contact - Salih Ben Otman",
  description: "Get in touch with Salih Ben Otman for collaboration opportunities, project inquiries, or to discuss your next digital solution.",
  keywords: "Contact, Get in Touch, Collaboration, Project Inquiry, Salih Ben Otman Contact",
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

