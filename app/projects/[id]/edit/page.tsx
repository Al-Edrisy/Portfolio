"use client"

import { use } from 'react'
import { EnhancedProjectForm } from '@/components/projects/forms/enhanced-project-form'
import { useProject } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import Navigation from '@/components/ui/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Loader2
} from 'lucide-react'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  const { user } = useAuth()
  const router = useRouter()
  const { project, loading, error } = useProject(id)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check permissions
    if (project && user.id !== project.authorId && user.role !== 'admin') {
      router.push(`/projects/${id}`)
      return
    }
  }, [user, project, router, id])

  if (!user) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-[60vh] flex items-center justify-center"
                >
                  <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <h2 className="text-xl font-semibold mb-2">Redirecting to Login</h2>
                        <p className="text-muted-foreground">
                          Please sign in to edit projects
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
    )
  }

  if (loading) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-[60vh] flex items-center justify-center"
                >
                  <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <h2 className="text-xl font-semibold mb-2">Loading Project</h2>
                        <p className="text-muted-foreground">
                          Please wait while we load your project...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
    )
  }

  if (error || !project) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-[60vh] flex items-center justify-center"
                >
                  <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                          {error || "The project you're looking for doesn't exist or you don't have permission to edit it."}
                        </p>
                        <Button onClick={() => router.back()} variant="outline">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Go Back
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
    )
  }

  const handleSuccess = (updatedProject: any) => {
    router.push(`/projects/${updatedProject.id}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EnhancedProjectForm
                project={project}
                mode="edit"
                onSuccess={handleSuccess}
                onCancel={() => router.push(`/projects/${id}`)}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
