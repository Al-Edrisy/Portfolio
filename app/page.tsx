import { Suspense } from "react"
import { Metadata } from "next"
import HeroSection from "@/components/sections/hero-section"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import { FeedbackSection } from "@/components/feedback"
import { GitHubActivitySection } from "@/components/sections/github-activity-section"

export const metadata: Metadata = {
  title: "Salih Ben Otman - Full Stack Developer | React, Next.js, AI Integration Expert",
  description: "Full Stack Software Developer with 5+ years building modern web applications. Specialized in React, Next.js, TypeScript, Node.js, and AI integrations. View 50+ completed projects, hire for freelance work.",
  keywords: [
    "Salih Ben Otman",
    "Full Stack Developer",
    "React Developer",
    "Next.js Expert",
    "TypeScript Developer",
    "UI/UX Engineer",
    "AI Integration",
    "OpenAI Developer",
    "Web Development Portfolio",
    "Freelance Developer",
    "Software Engineer for Hire",
    "Modern Web Applications",
    "Scalable Web Solutions",
  ],
  authors: [{ name: "Salih Ben Otman", url: "https://salihbenotman.dev" }],
  creator: "Salih Ben Otman",
  openGraph: {
    title: "Salih Ben Otman - Full Stack Developer Portfolio",
    description: "Professional Software Developer with 5+ years experience. Expert in React, Next.js, TypeScript, and AI integrations. 50+ completed projects.",
    url: "https://salihbenotman.dev",
    siteName: "Salih Ben Otman Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salih Ben Otman - Full Stack Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salih Ben Otman - Full Stack Developer",
    description: "Full Stack Developer specializing in React, Next.js, TypeScript & AI. 50+ projects completed.",
    creator: "@salihbenotman",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://salihbenotman.dev",
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
        <HeroSection />
        <Suspense fallback={<LoadingFallback />}>
          <GitHubActivitySection />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <FeedbackSection />
        </Suspense>
      </main>
    </ErrorBoundary>
  )
}
