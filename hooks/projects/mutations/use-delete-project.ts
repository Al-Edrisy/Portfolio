"use client"

import { useState } from 'react'
import { doc, deleteDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useDeleteProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const deleteProject = async (projectId: string, projectTitle?: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to delete projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete projects",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
      
      // Delete the project document
      await deleteDoc(projectRef)

      // Update user's project count
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          projectsCount: increment(-1),
          lastActiveAt: serverTimestamp()
        })
      }

      // Note: In a production app, you might want to:
      // 1. Delete associated comments
      // 2. Delete associated reactions
      // 3. Delete associated analytics data
      // For now, we'll leave orphaned data (Firestore rules will handle access)

      toast({
        title: "Project Deleted",
        description: `"${projectTitle || 'Project'}" has been deleted successfully`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete project'
      setError(errorMessage)
      
      toast({
        title: "Error Deleting Project",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error deleting project:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const softDeleteProject = async (projectId: string, projectTitle?: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to delete projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete projects",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
      
      // Soft delete by unpublishing and marking as deleted
      await updateDoc(projectRef, {
        published: false,
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user.id,
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          lastActiveAt: serverTimestamp()
        })
      }

      toast({
        title: "Project Archived",
        description: `"${projectTitle || 'Project'}" has been archived and is no longer visible`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to archive project'
      setError(errorMessage)
      
      toast({
        title: "Error Archiving Project",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error archiving project:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const restoreProject = async (projectId: string, projectTitle?: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to restore projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to restore projects",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
      
      // Restore the project
      await updateDoc(projectRef, {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          lastActiveAt: serverTimestamp()
        })
      }

      toast({
        title: "Project Restored",
        description: `"${projectTitle || 'Project'}" has been restored successfully`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to restore project'
      setError(errorMessage)
      
      toast({
        title: "Error Restoring Project",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error restoring project:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteProject,
    softDeleteProject,
    restoreProject,
    loading,
    error
  }
}
