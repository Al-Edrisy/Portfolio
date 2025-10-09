import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import ScrollProgress from "@/components/ui/scroll-progress"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthErrorHandler } from "@/components/auth/auth-error-handler"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalErrorHandler } from "@/components/ui/global-error-handler"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Salih Ben Otman - UI/UX Engineer & AI Systems Builder",
  description:
    "Portfolio of Salih Ben Otman, a UI/UX Engineer and AI Systems Builder with 5+ years of experience in full-stack development, AI integrations, and modern web technologies.",
  keywords: "UI/UX Engineer, AI Systems Builder, Full-Stack Developer, React, Next.js, OpenAI, Langflow, TypeScript",
  authors: [{ name: "Salih Ben Otman" }],
  creator: "Salih Ben Otman",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salihbenotman.dev",
    title: "Salih Ben Otman - UI/UX Engineer & AI Systems Builder",
    description:
      "Portfolio showcasing innovative digital solutions, AI integrations, and exceptional user experiences.",
    siteName: "Salih Ben Otman Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salih Ben Otman - UI/UX Engineer & AI Systems Builder",
    description:
      "Portfolio showcasing innovative digital solutions, AI integrations, and exceptional user experiences.",
    creator: "@salihbenotman",
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
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GlobalErrorHandler />
            <AuthErrorHandler />
            <Suspense fallback={null}>
              <ScrollProgress />
              {children}
            </Suspense>
            <Toaster />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
