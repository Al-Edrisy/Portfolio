"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to home
      router.push('/')
    } else if (!loading && user && requireAdmin && !isAdmin) {
      // User is authenticated but not admin, redirect to home
      router.push('/')
    }
  }, [user, loading, isAdmin, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
