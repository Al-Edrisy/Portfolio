"use client"

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useToggleFeatured() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const toggleFeatured = async (projectId: string, currentFeatured: boolean, projectTitle?: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to manage featured projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage featured projects",
        variant: "destructive"
      })
      return false
    }

    // Check if user is admin (only admins should be able to toggle featured status)
    if (user.role !== 'admin') {
      setError('Only administrators can manage featured projects')
      toast({
        title: "Permission Denied",
        description: "Only administrators can manage featured projects",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
      const newFeaturedStatus = !currentFeatured
      
      await updateDoc(projectRef, {
        featured: newFeaturedStatus,
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          lastActiveAt: serverTimestamp()
        })
      }

      toast({
        title: newFeaturedStatus ? "Project Featured" : "Project Unfeatured",
        description: `"${projectTitle || 'Project'}" has been ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle featured status'
      setError(errorMessage)
      
      toast({
        title: "Error Updating Featured Status",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error toggling featured status:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const setFeatured = async (projectId: string, featured: boolean, projectTitle?: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to manage featured projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage featured projects",
        variant: "destructive"
      })
      return false
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      setError('Only administrators can manage featured projects')
      toast({
        title: "Permission Denied",
        description: "Only administrators can manage featured projects",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
      
      await updateDoc(projectRef, {
        featured: featured,
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          lastActiveAt: serverTimestamp()
        })
      }

      toast({
        title: featured ? "Project Featured" : "Project Unfeatured",
        description: `"${projectTitle || 'Project'}" has been ${featured ? 'featured' : 'unfeatured'} successfully`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update featured status'
      setError(errorMessage)
      
      toast({
        title: "Error Updating Featured Status",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error updating featured status:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleFeatured,
    setFeatured,
    loading,
    error
  }
}
