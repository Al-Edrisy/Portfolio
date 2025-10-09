import { Suspense } from "react"
import ProjectModal from "@/components/projects/project-modal"
import { Loader2 } from "lucide-react"

interface ModalPageProps {
  params: Promise<{
    id: string
  }>
}

function LoadingModal() {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
        <p className="text-white">Loading project...</p>
      </div>
    </div>
  )
}

export default async function ModalPage({ params }: ModalPageProps) {
  const { id } = await params
  
  return (
    <Suspense fallback={<LoadingModal />}>
      <ProjectModal projectId={id} />
    </Suspense>
  )
}

