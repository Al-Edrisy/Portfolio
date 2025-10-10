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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formProgress, setFormProgress] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) {
      console.log('Auth is still loading...')
      return
    }

    console.log('Auth loaded. User:', user)
    setIsCheckingAuth(false)
    
    // If no user after auth loads, redirect to login
    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    // Check if user can create projects (developer or admin)
    // Temporarily allow all authenticated users for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment && user.role !== 'developer' && user.role !== 'admin') {
      console.log('User does not have permission to create projects. Role:', user.role)
      router.push('/')
      return
    }

    console.log('User has permission to create projects')
  }, [user, authLoading, router])

  // Show loading state while checking authentication
  if (authLoading || isCheckingAuth) {
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
                        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
                        <p className="text-muted-foreground">
                          Checking authentication
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

  // Show login redirect if no user after auth loads
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

  // Check if user has permission to create projects
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment && user.role !== 'developer' && user.role !== 'admin') {
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
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground mb-4">
                          You don't have permission to create projects. Only developers and admins can create projects.
                        </p>
                        <div className="space-y-2">
                          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                            Go Home
                          </Button>
                          <Button onClick={() => router.push('/contact')} variant="default" className="w-full">
                            Request Developer Access
                          </Button>
                        </div>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
                    
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <Progress value={formProgress} className="flex-1 sm:w-24" />
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
                    Build Your Project
                  </motion.h1>
                  <motion.p 
                    className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-4"
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
                            {index < steps.length - 1 && (
                              <div className={`
                                absolute top-5 md:top-6 left-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-300 hidden md:block
                                ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                              `} style={{ width: 'calc(100% - 2.5rem)', marginLeft: '1.25rem' }} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">Quality Images</h3>
                          <p className="text-xs text-muted-foreground">High-res screenshots work best</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Target className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">Clear Description</h3>
                          <p className="text-xs text-muted-foreground">Highlight your skills</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Code2 className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">Tech Stack</h3>
                          <p className="text-xs text-muted-foreground">Show your expertise</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-muted/20 bg-muted/5 hover:bg-muted/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/10 rounded-lg">
                          <Link className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">Live Demo</h3>
                          <p className="text-xs text-muted-foreground">Add working links</p>
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
