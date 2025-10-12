import ProjectModal from "@/components/projects/project-modal"

interface ModalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ModalPage({ params }: ModalPageProps) {
  const { id } = await params
  
  // ProjectModal handles its own loading state, no need for Suspense fallback
  return <ProjectModal projectId={id} />
}

