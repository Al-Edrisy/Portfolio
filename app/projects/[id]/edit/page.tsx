"use client"

import { use, useState } from 'react'
import { EnhancedProjectForm } from '@/components/projects/forms/enhanced-project-form'
import { useProject } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import Navigation from '@/components/ui/navigation'
// Custom cursor removed - using default browser cursor
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Code2,
  Link as LinkIcon,
  CheckCircle
} from 'lucide-react'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { project, loading, error } = useProject(id)
  const [currentStep, setCurrentStep] = useState(1)
  const [formProgress, setFormProgress] = useState(0)

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

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText, description: 'Project title and description' },
    { id: 2, title: 'Details', icon: ImageIcon, description: 'Images and category' },
    { id: 3, title: 'Tech Stack', icon: Code2, description: 'Technologies used' },
    { id: 4, title: 'Links', icon: LinkIcon, description: 'Demo and repository links' },
    { id: 5, title: 'Review', icon: CheckCircle, description: 'Final review and publish' }
  ]

  return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Modern Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.back()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Badge variant="secondary" className="gap-2 px-3 py-1">
                      <Sparkles className="w-3 h-3" />
                      Edit Project
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <Progress value={formProgress} className="w-24" />
                    <span className="text-sm font-medium">{Math.round(formProgress)}%</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <motion.h1
                    className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Update Your Project
                  </motion.h1>
                  <motion.p
                    className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Edit and refine your project details to keep your portfolio up to date
                  </motion.p>
                </div>
              </motion.div>

              {/* Step Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-12"
              >
                <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                      {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = currentStep === step.id
                        const isCompleted = currentStep > step.id

                        return (
                          <motion.div
                            key={step.id}
                            className="flex flex-col items-center text-center flex-1 min-w-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                          >
                            <div className={`
                              relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3 transition-all duration-300
                              ${isActive
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110'
                                : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-muted text-muted-foreground'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                              ) : (
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className={`font-semibold text-xs md:text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.title}
                              </p>
                              <p className="text-xs text-muted-foreground hidden md:block">
                                {step.description}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Form Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="border-primary/10 shadow-xl">
                  <CardContent className="p-0">
                    <EnhancedProjectForm
                      project={project}
                      mode="edit"
                      onSuccess={handleSuccess}
                      onCancel={() => router.push(`/projects/${id}`)}
                      onProgressChange={setFormProgress}
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
  )
}
