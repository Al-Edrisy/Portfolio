"use client"

import { ProjectForm } from '@/components/projects'
import { useProject } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/ui/navigation'
import { UserCursor } from '@/components/ui/custom-cursor'
import { CursorProvider } from '@/components/ui/custom-cursor'

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { project, loading, error } = useProject(params.id)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check permissions
    if (project && user.id !== project.authorId && user.role !== 'admin') {
      router.push(`/projects/${params.id}`)
      return
    }
  }, [user, project, router, params.id])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <CursorProvider>
        <main className="min-h-screen bg-background">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-4">Loading project...</p>
              </div>
            </div>
          </div>
          <UserCursor />
        </main>
      </CursorProvider>
    )
  }

  if (error || !project) {
    return (
      <CursorProvider>
        <main className="min-h-screen bg-background">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  {error || "The project you're looking for doesn't exist or you don't have permission to edit it."}
                </p>
                <button 
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
          <UserCursor />
        </main>
      </CursorProvider>
    )
  }

  const handleSuccess = (updatedProject: any) => {
    router.push(`/projects/${updatedProject.id}`)
  }

  return (
    <CursorProvider>
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Edit Project</h1>
                <p className="text-muted-foreground">
                  Update your project details and keep your portfolio current.
                </p>
              </div>
              
              <ProjectForm 
                project={project}
                mode="edit"
                onSuccess={handleSuccess}
                onCancel={() => router.push(`/projects/${params.id}`)}
              />
            </div>
          </div>
        </div>
        <UserCursor />
      </main>
    </CursorProvider>
  )
}
