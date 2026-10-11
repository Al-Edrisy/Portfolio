import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectById } from "@/lib/firebase/utils/firebase-utils"
import ProjectPageClient from "@/components/projects/project-page-client"
import ErrorBoundary from "@/components/ui/error-boundary"
import Footer from "@/components/ui/footer"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate comprehensive metadata for SEO, GEO, and social platforms
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const project = await getProjectById(id)
    
    if (!project) {
      return {
        title: "Project Not Found | Salih Ben Otman Portfolio",
        description: "The requested software development project could not be found.",
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const title = `${project.title} | Salih Ben Otman - Project Showcase`
    const rawDescription = project.description || "Interactive software project built with modern web architecture."
    const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription
    const canonicalUrl = `https://salihbenotman.dev/projects/${id}`
    const imageUrl = (project.images && project.images.length > 0)
      ? project.images[0]
      : (project.image || "https://salihbenotman.dev/og-image.png")

    const techKeywords = Array.isArray(project.tech) ? project.tech : []

    let publishedDateStr: string | undefined
    try {
      if (project.createdAt) {
        const d = typeof project.createdAt === 'string'
          ? new Date(project.createdAt)
          : ((project.createdAt as any)?.toDate ? (project.createdAt as any).toDate() : new Date(project.createdAt as any))
        publishedDateStr = d.toISOString()
      }
    } catch {
      publishedDateStr = undefined
    }

    let modifiedDateStr: string | undefined
    try {
      if (project.updatedAt) {
        const d = typeof project.updatedAt === 'string'
          ? new Date(project.updatedAt)
          : ((project.updatedAt as any)?.toDate ? (project.updatedAt as any).toDate() : new Date(project.updatedAt as any))
        modifiedDateStr = d.toISOString()
      }
    } catch {
      modifiedDateStr = publishedDateStr
    }

    return {
      title,
      description,
      keywords: [
        ...techKeywords,
        project.title,
        "Software Engineering",
        "Salih Ben Otman",
        "Full Stack Development",
        "Web Application",
        "TypeScript",
        "React",
        "Next.js",
        "System Architecture",
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "article",
        publishedTime: publishedDateStr,
        modifiedTime: modifiedDateStr || publishedDateStr,
        authors: ["https://salihbenotman.dev"],
        section: "Technology",
        tags: techKeywords,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${project.title} - Built by Salih Ben Otman`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        creator: "@salihbenotman",
        images: [imageUrl],
      },
      other: {
        // Google Scholar & Academic metadata
        "citation_title": project.title,
        "citation_author": "Salih Ben Otman",
        "citation_publication_date": publishedDateStr ? publishedDateStr.slice(0, 4) : "2024",
        "citation_technical_report_institution": "Final International University",
        // Generative Engine Optimization pointers
        "llms-txt": "https://salihbenotman.dev/llms.txt",
      },
    }
  } catch (error) {
    return {
      title: "Project Showcase | Salih Ben Otman Portfolio",
      description: "Explore software development project architecture, stack, and interactive demo.",
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const totalReactions = project.reactionsCount 
    ? Object.values(project.reactionsCount).reduce((sum, n) => sum + (n || 0), 0)
    : 0

  const primaryImage = (project.images && project.images.length > 0)
    ? project.images[0]
    : (project.image || "https://salihbenotman.dev/og-image.png")

  // Machine-readable JSON-LD Schema for Google, Bing, ChatGPT, Gemini, Perplexity
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "SoftwareSourceCode"],
        "@id": `https://salihbenotman.dev/projects/${id}#software`,
        "name": project.title,
        "description": project.description,
        "url": `https://salihbenotman.dev/projects/${id}`,
        "image": primaryImage,
        "applicationCategory": "WebApplication",
        "operatingSystem": "All",
        "programmingLanguage": project.tech || [],
        ...(project.github ? { "codeRepository": project.github } : {}),
        ...(project.link ? { "installUrl": project.link } : {}),
        "author": {
          "@type": "Person",
          "@id": "https://salihbenotman.dev/#person",
          "name": "Salih Ben Otman",
          "url": "https://salihbenotman.dev",
          "affiliation": {
            "@type": "EducationalOrganization",
            "name": "Final International University"
          }
        },
        ...(totalReactions > 0 ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": totalReactions.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        } : {}),
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": totalReactions
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": project.commentsCount || 0
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://salihbenotman.dev/projects/${id}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://salihbenotman.dev"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Projects",
            "item": "https://salihbenotman.dev/projects"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": project.title,
            "item": `https://salihbenotman.dev/projects/${id}`
          }
        ]
      }
    ]
  }

  return (
    <ErrorBoundary>
      {/* Dynamic Project JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <ProjectPageClient projectId={id} />
      </main>
      <Footer />
    </ErrorBoundary>
  )
}
