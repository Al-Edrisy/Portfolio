"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { LogIn, LogOut, User, Crown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ClientOnly } from '@/components/ui/client-only'
import { SignInModal } from './signin-modal'

export function AuthButton() {
  const { user, loading, signInWithGoogle, logout, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      })
    } catch (error: any) {
      // Don't show error for popup closed by user
      if (error.code === 'auth/popup-closed-by-user') {
        return
      }
      
      // Don't show error for cancelled by user
      if (error.code === 'auth/cancelled-popup-request') {
        return
      }
      
      // Show error for other cases
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred while signing in.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      })
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      })
    }
  }

  const handleAdminPanel = () => {
    router.push('/admin/projects')
  }

  // Wrap the entire component in ClientOnly to prevent hydration mismatch
  return (
    <ClientOnly
      fallback={
        <Button disabled variant="ghost" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </Button>
      }
    >
      <AuthButtonContent
        user={user}
        loading={loading}
        signInWithGoogle={signInWithGoogle}
        logout={logout}
        isAdmin={isAdmin}
        onAdminPanel={handleAdminPanel}
        onSignIn={handleSignIn}
        onLogout={handleLogout}
      />
    </ClientOnly>
  )
}

function AuthButtonContent({
  user,
  loading,
  signInWithGoogle,
  logout,
  isAdmin,
  onAdminPanel,
  onSignIn,
  onLogout,
}: {
  user: any
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  onAdminPanel: () => void
  onSignIn: () => void
  onLogout: () => void
}) {

  if (loading) {
    return (
      <Button disabled variant="ghost" className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <SignInModal>
        <Button className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </Button>
      </SignInModal>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-500 flex items-center justify-center">
              <Crown className="h-2 w-2 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-600 font-medium">Admin</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={onAdminPanel} className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
