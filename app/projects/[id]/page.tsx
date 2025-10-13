import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectById } from "@/lib/firebase/utils/firebase-utils"
import ProjectPageClient from "@/components/projects/project-page-client"
import ErrorBoundary from "@/components/ui/error-boundary"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const project = await getProjectById(id)
    
    if (!project) {
      return {
        title: "Project Not Found",
        description: "The requested project could not be found."
      }
    }

    return {
      title: `${project.title} - Salih Ben Otman Portfolio`,
      description: project.description,
      keywords: project.tech?.join(", ") || "",
      openGraph: {
        title: project.title,
        description: project.description,
        images: project.images && project.images.length > 0 ? [project.images[0]] : 
                project.image ? [project.image] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description,
        images: project.images && project.images.length > 0 ? [project.images[0]] : 
                project.image ? [project.image] : [],
      },
    }
  } catch (error) {
    return {
      title: "Project - Salih Ben Otman Portfolio",
      description: "View project details and interact with the portfolio."
    }
  }
}

// Removed LoadingFallback to prevent duplicate loading indicators

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <ProjectPageClient projectId={id} />
      </main>
    </ErrorBoundary>
  )
}
