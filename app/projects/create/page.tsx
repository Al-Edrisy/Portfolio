"use client"

import { EnhancedProjectForm } from '@/components/projects/forms/enhanced-project-form'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Navigation from '@/components/ui/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
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

    // Check if user can create projects (developer)
    // Temporarily allow all authenticated users for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment && user.role !== 'developer') {
      console.log('User does not have permission to create projects. Role:', user.role)
      router.push('/')
      return
    }

    console.log('User has permission to create projects')
  }, [user, authLoading, router])

  // Show loading state while checking authentication
  if (authLoading || isCheckingAuth) {
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
      </main>
    )
  }

  // Show login redirect if no user after auth loads
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
                        Please sign in to create projects
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

  // Check if user has permission to create projects
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment && user.role !== 'developer') {
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
      </main>
    )
  }

  const handleSuccess = (project: any) => {
    router.push(`/projects/${project.id}`)
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
                mode="create"
                onSuccess={handleSuccess}
                onCancel={() => router.back()}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
