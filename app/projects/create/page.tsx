"use client"

import { ProjectForm } from '@/components/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import Navigation from '@/components/ui/navigation'
import { UserCursor } from '@/components/ui/custom-cursor'
import { CursorProvider } from '@/components/ui/custom-cursor'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  Users,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateProjectPage() {
  const { user } = useAuth()
  const router = useRouter()

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

  return (
    <CursorProvider>
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Enhanced Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Badge variant="secondary" className="gap-2">
                        <Sparkles className="w-3 h-3" />
                        New Project
                      </Badge>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
                      Create Your Project
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                      Share your amazing work with the world. Build your portfolio and showcase your skills.
                    </p>
                  </div>
                </div>

                {/* Quick Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Pro Tip</h3>
                          <p className="text-xs text-muted-foreground">
                            Add high-quality images to make your project stand out
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Focus</h3>
                          <p className="text-xs text-muted-foreground">
                            Write clear descriptions that highlight your skills
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Engage</h3>
                          <p className="text-xs text-muted-foreground">
                            Add live demos and GitHub links for credibility
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Enhanced Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ProjectForm 
                  mode="create"
                  onSuccess={handleSuccess}
                  onCancel={() => router.back()}
                />
              </motion.div>
            </div>
          </div>
        </div>
        <UserCursor />
      </main>
    </CursorProvider>
  )
}
