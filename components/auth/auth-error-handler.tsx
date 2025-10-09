"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function AuthErrorHandler() {
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Handle redirect result when user returns from Google sign-in
    const handleRedirectResult = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth')
        const { auth } = await import('@/lib/firebase')
        
        const result = await getRedirectResult(auth)
        if (result) {
          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          })
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error)
        // Don't show error toast for redirect results
      }
    }

    // Only run this on the client side
    if (typeof window !== 'undefined') {
      handleRedirectResult()
    }
  }, [toast])

  // This component doesn't render anything
  return null
}
