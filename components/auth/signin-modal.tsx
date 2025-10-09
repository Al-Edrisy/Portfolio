"use client"

import { useState } from 'react'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, ExternalLink, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SignInModalProps {
  children: React.ReactNode
}

export function SignInModal({ children }: SignInModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePopupSignIn = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
      setIsOpen(false)
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      })
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User cancelled, don't show error
        return
      }
      
      if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site or try the redirect method.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred while signing in.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRedirectSignIn = async () => {
    try {
      setLoading(true)
      await signInWithRedirect(auth, googleProvider)
      // The page will redirect, so we don't need to handle success here
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred while signing in.",
        variant: "destructive",
      })
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
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign in to your account
          </DialogTitle>
          <DialogDescription>
            Choose your preferred sign-in method to continue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sign in to access admin features, create projects, and interact with the portfolio.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button
              onClick={handlePopupSignIn}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? "Signing in..." : "Sign in with Google (Popup)"}
            </Button>
            
            <Button
              onClick={handleRedirectSignIn}
              disabled={loading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Sign in with Google (Redirect)
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>• Popup method opens in a new window</p>
            <p>• Redirect method navigates away and returns</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
