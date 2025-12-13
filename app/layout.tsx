import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import ScrollProgress from "@/components/ui/scroll-progress"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthErrorHandler } from "@/components/auth/auth-error-handler"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalErrorHandler } from "@/components/ui/global-error-handler"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  metadataBase: new URL('https://salihbenotman.dev'),
  title: {
    default: "Salih Ben Otman - Full Stack Software Developer | UI/UX Engineer | AI Systems Builder",
    template: "%s | Salih Ben Otman Portfolio"
  },
  description:
    "Salih Ben Otman - Professional Full Stack Software Developer & UI/UX Engineer with 5+ years experience. Expert in React, Next.js, TypeScript, Node.js, AI integrations (OpenAI, Langflow), and modern web development. Specializing in scalable web applications, responsive design, and innovative digital solutions. Portfolio showcasing 50+ completed projects.",
  keywords: [
    // Primary Keywords - Name & Identity
    "Salih Ben Otman",
    "Salih Ben Otman Developer",
    "Salih Ben Otman Portfolio",
    "Salih Ben Otman Software Engineer",

    // Job Titles & Roles
    "Full Stack Developer",
    "Full Stack Software Developer",
    "Software Engineer",
    "UI/UX Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "Software Development Engineer",
    "AI Systems Builder",

    // Technical Skills - Frontend
    "React Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "JavaScript Developer",
    "HTML5 CSS3",
    "Tailwind CSS",
    "Responsive Web Design",
    "Frontend Development",
    "Modern Web Development",

    // Technical Skills - Backend
    "Node.js Developer",
    "Express.js",
    "API Development",
    "RESTful API",
    "Backend Development",
    "Server-Side Development",

    // Databases
    "Firebase",
    "Firestore",
    "MongoDB",
    "PostgreSQL",
    "Database Design",
    "SQL Developer",

    // AI & Advanced Technologies
    "OpenAI Integration",
    "AI Developer",
    "Langflow",
    "Machine Learning",
    "ChatGPT Integration",
    "AI Systems",
    "Artificial Intelligence Developer",

    // Tools & Platforms
    "Git",
    "GitHub",
    "Vercel",
    "VS Code",
    "Figma",

    // Specializations
    "Web Application Development",
    "Scalable Architecture",
    "System Design",
    "User Experience Design",
    "User Interface Design",
    "Mobile-First Design",
    "Single Page Applications",

    // Service-based Keywords
    "Freelance Developer",
    "Software Consultant",
    "Web Development Services",
    "Custom Web Applications",
    "Portfolio Website Development",

    // Location & Education
    "North Cyprus Developer",
    "FIU Software Engineering",
    "Software Engineering Student",

    // Project Types
    "E-commerce Development",
    "Dashboard Development",
    "SaaS Development",
    "Content Management Systems",

    // Soft Skills
    "Problem Solving",
    "Team Collaboration",
    "Agile Development",
    "Code Quality",
    "Clean Code",
  ],
  authors: [
    { name: "Salih Ben Otman" },
    { name: "Salih Ben Otman", url: "https://salihbenotman.dev" }
  ],
  creator: "Salih Ben Otman",
  publisher: "Salih Ben Otman",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salihbenotman.dev",
    title: "Salih Ben Otman - Full Stack Software Developer Portfolio",
    description:
      "Professional Software Developer Portfolio - 5+ years experience in Full Stack Development, UI/UX Engineering, and AI Systems. Specializing in React, Next.js, TypeScript, Node.js, and modern web technologies. 50+ completed projects.",
    siteName: "Salih Ben Otman Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salih Ben Otman - Full Stack Software Developer Portfolio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salih Ben Otman - Full Stack Software Developer",
    description:
      "Professional Software Developer with 5+ years experience. Expert in React, Next.js, TypeScript, AI integrations. Portfolio showcasing innovative digital solutions.",
    creator: "@salihbenotman",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://salihbenotman.dev",
  },
  category: "technology",
  classification: "Software Development Portfolio",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // JSON-LD structured data for better SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://salihbenotman.dev/#person",
        "name": "Salih Ben Otman",
        "alternateName": "Salih Ben Otman",
        "url": "https://salihbenotman.dev",
        "image": "https://salihbenotman.dev/og-image.png",
        "jobTitle": "Full Stack Software Developer",
        "description": "Professional Full Stack Software Developer & UI/UX Engineer with 5+ years experience in modern web development, AI integrations, and scalable system architecture.",
        "knowsAbout": [
          "Software Development",
          "Full Stack Development",
          "UI/UX Design",
          "React",
          "Next.js",
          "TypeScript",
          "JavaScript",
          "Node.js",
          "AI Integration",
          "OpenAI",
          "Web Development",
          "Frontend Development",
          "Backend Development",
          "Database Design",
          "System Architecture"
        ],
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Final International University",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "North Cyprus"
          }
        },
        "sameAs": [
          "https://github.com/Al-Edrisy",
          "https://www.linkedin.com/in/salih-otman-a565a2242",
          "https://www.facebook.com/share/14GHt7scAjF"
        ],
        "email": "salehfree33@gmail.com",
        "telephone": "+218 92 152 70 18"
      },
      {
        "@type": "WebSite",
        "@id": "https://salihbenotman.dev/#website",
        "url": "https://salihbenotman.dev",
        "name": "Salih Ben Otman Portfolio",
        "description": "Portfolio website of Salih Ben Otman, showcasing professional software development projects, skills, and experience.",
        "publisher": {
          "@id": "https://salihbenotman.dev/#person"
        },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://salihbenotman.dev/projects?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ProfilePage",
        "@id": "https://salihbenotman.dev/#profilepage",
        "url": "https://salihbenotman.dev",
        "name": "Al-Edrisy (Salih Ben Otman) - Professional Software Developer Portfolio",
        "isPartOf": {
          "@id": "https://salihbenotman.dev/#website"
        },
        "about": {
          "@id": "https://salihbenotman.dev/#person"
        },
        "description": "Professional portfolio showcasing software development expertise, completed projects, technical skills, and professional experience.",
        "breadcrumb": {
          "@id": "https://salihbenotman.dev/#breadcrumb"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://salihbenotman.dev/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://salihbenotman.dev"
          }
        ]
      }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GlobalErrorHandler />
            <AuthErrorHandler />
            <TooltipProvider>
              <Suspense fallback={null}>
                <ScrollProgress />
                {children}
              </Suspense>
              <Toaster />
            </TooltipProvider>
            {/* Only load Vercel Analytics when deployed on Vercel */}
            {process.env.NODE_ENV === 'production' && process.env.VERCEL && <Analytics />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
