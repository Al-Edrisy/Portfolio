import { Metadata } from "next"
import AboutSection from "@/components/sections/about-section"
import ErrorBoundary from "@/components/ui/error-boundary"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"
import { SITE_URL, profile, yearsOfExperience } from "@/constants/profile"

const years = yearsOfExperience()
const pageUrl = `${SITE_URL}/about`
// The root layout appends " | Salih Ben Otman Portfolio", so keep this short to stay under ~60 chars.
const title = `About ${profile.name}`
const socialTitle = `About ${profile.name} – Full Stack, UI/UX & AI Systems Engineer`
const description = `${profile.name} (${profile.alias}) is a full stack software developer, UI/UX engineer and AI systems builder in ${profile.location} with ${years}+ years of experience. B.Sc. in Software Engineering at ${profile.university.name}.`

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Salih Ben Otman",
    "Al-Edrisy",
    "Full Stack Developer",
    "UI/UX Engineer",
    "AI Systems Builder",
    "Next.js Developer",
    "Agentic AI",
    "Final International University",
    "North Cyprus",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: socialTitle,
    description,
    url: pageUrl,
    type: "profile",
    // Points at the generated image route. The previous "/og-image.png" did not exist (404).
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${profile.name} – About` }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    creator: "@salihbenotman",
    images: ["/opengraph-image"],
  },
  other: {
    citation_author: profile.name,
    citation_institution: profile.university.name,
    "llms-txt": `${SITE_URL}/llms.txt`,
    "llms-full-txt": `${SITE_URL}/llms-full.txt`,
  },
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#aboutpage`,
      url: pageUrl,
      name: `About ${profile.name}`,
      description,
      inLanguage: "en",
      mainEntity: { "@id": `${SITE_URL}/#person` },
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: profile.name,
      alternateName: profile.alias,
      url: SITE_URL,
      image: `${SITE_URL}/me.jpg`,
      jobTitle: profile.role,
      description,
      email: `mailto:${profile.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Kyrenia", addressCountry: "CY" },
      alumniOf: { "@type": "CollegeOrUniversity", name: profile.university.name },
      knowsAbout: [
        "Full-stack web development",
        "Next.js",
        "React",
        "TypeScript",
        "Agentic AI",
        "LLM orchestration",
        "UI/UX engineering",
      ],
      sameAs: [profile.social.github, profile.social.linkedin, profile.social.leetcode],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "About", item: pageUrl },
      ],
    },
  ],
}

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        // `<` is escaped so no string in the data can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />
      <main id="main-content" className="min-h-screen bg-background pt-20">
        <AboutSection />
      </main>
      <Footer />
    </ErrorBoundary>
  )
}
