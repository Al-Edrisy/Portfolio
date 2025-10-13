"use client"

import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Info, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SignInModalProps {
  children: React.ReactNode
}

export function SignInModal({ children }: SignInModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    try {
      setLoading(true)
      
      // Configure Google provider for better popup experience
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      
      await signInWithPopup(auth, googleProvider)
      
      // Close modal on success
      setIsOpen(false)
      
      toast({
        title: "Welcome! 🎉",
        description: "You've successfully signed in.",
      })
    } catch (error: any) {
      // User cancelled the popup - don't show error
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        return
      }
      
      // Popup was blocked by browser
      if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Popup Blocked 🚫",
          description: "Please allow popups in your browser settings and try again.",
          variant: "destructive",
        })
        return
      }
      
      // Network or other errors
      if (error.code === 'auth/network-request-failed') {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        })
        return
      }
      
      // Generic error
      toast({
        title: "Sign in failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="h-5 w-5" />
            Sign in with Google
          </DialogTitle>
          <DialogDescription>
            Sign in to access additional features and interact with projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll be able to comment on projects, react to work, and manage your profile.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
