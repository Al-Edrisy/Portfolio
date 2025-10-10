"use client"

import { EnhancedProjectForm } from '@/components/projects/forms/enhanced-project-form'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Navigation from '@/components/ui/navigation'
import { UserCursor } from '@/components/ui/custom-cursor'
import { CursorProvider } from '@/components/ui/custom-cursor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  Users,
  Loader2,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Code2,
  Link,
  Globe,
  Rocket,
  Palette,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CreateProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formProgress, setFormProgress] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check if user can create projects (developer or admin)
    if (user.role !== 'developer' && user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, router])

  if (!user) {
    return (
      <CursorProvider>
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
                          Please sign in to create projects
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
          <UserCursor />
        </main>
      </CursorProvider>
    )
  }

  const handleSuccess = (project: any) => {
    router.push(`/projects/${project.id}`)
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText, description: 'Project title and description' },
    { id: 2, title: 'Details', icon: ImageIcon, description: 'Images and category' },
    { id: 3, title: 'Tech Stack', icon: Code2, description: 'Technologies used' },
    { id: 4, title: 'Links', icon: Link, description: 'Demo and repository links' },
    { id: 5, title: 'Review', icon: CheckCircle, description: 'Final review and publish' }
  ]

  return (
    <CursorProvider>
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
                <div className="flex items-center justify-between mb-6">
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
                      Create Project
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
                    className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Build Your Project
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Create an impressive project showcase that highlights your skills and attracts opportunities
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = currentStep === step.id
                        const isCompleted = currentStep > step.id
                        
                        return (
                          <motion.div
                            key={step.id}
                            className="flex flex-col items-center text-center flex-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                          >
                            <div className={`
                              relative w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                              ${isActive 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110' 
                                : isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-muted text-muted-foreground'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <Icon className="w-6 h-6" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                            {index < steps.length - 1 && (
                              <div className={`
                                absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-300
                                ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                              `} style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }} />
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-blue-200/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Quality Images</h3>
                          <p className="text-xs text-blue-700 dark:text-blue-300">High-res screenshots work best</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200/50 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">Clear Description</h3>
                          <p className="text-xs text-green-700 dark:text-green-300">Highlight your skills</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200/50 bg-purple-50/50 dark:border-purple-800/50 dark:bg-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Tech Stack</h3>
                          <p className="text-xs text-purple-700 dark:text-purple-300">Show your expertise</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200/50 bg-orange-50/50 dark:border-orange-800/50 dark:bg-orange-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Link className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-orange-900 dark:text-orange-100">Live Demo</h3>
                          <p className="text-xs text-orange-700 dark:text-orange-300">Add working links</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                      mode="create"
                      onSuccess={handleSuccess}
                      onCancel={() => router.back()}
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
        <UserCursor />
      </main>
    </CursorProvider>
  )
}
