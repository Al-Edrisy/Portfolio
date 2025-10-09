"use client"

import { useState } from 'react'
import { doc, updateDoc, deleteDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useDeleteComment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const deleteComment = async (commentId: string, hardDelete: boolean = false): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to delete comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete comments",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      // Get comment data first to update counters
      const commentDoc = await getDoc(commentRef)
      if (!commentDoc.exists()) {
        setError('Comment not found')
        toast({
          title: "Comment Not Found",
          description: "The comment you're trying to delete doesn't exist",
          variant: "destructive"
        })
        return false
      }

      const commentData = commentDoc.data()
      const projectId = commentData.projectId
      const parentCommentId = commentData.parentCommentId
      const repliesCount = commentData.repliesCount || 0

      if (hardDelete) {
        // Hard delete - permanently remove the comment
        await deleteDoc(commentRef)
      } else {
        // Soft delete - mark as deleted but keep the data
        await updateDoc(commentRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: user.id,
          content: '[This comment has been deleted]',
          updatedAt: serverTimestamp()
        })
      }

      // Update project's comment count
      if (projectId) {
        await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
          commentsCount: increment(-1),
          updatedAt: serverTimestamp()
        })
      }

      // If this comment has replies, update the parent comment's replies count
      if (parentCommentId && repliesCount > 0) {
        await updateDoc(doc(db, COLLECTIONS.COMMENTS, parentCommentId), {
          repliesCount: increment(-1),
          updatedAt: serverTimestamp()
        })
      }

      // Update user's comment count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        commentsCount: increment(-1),
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: hardDelete ? "Comment Deleted" : "Comment Hidden",
        description: hardDelete 
          ? "Comment has been permanently deleted" 
          : "Comment has been hidden from view",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete comment'
      setError(errorMessage)
      
      toast({
        title: "Error Deleting Comment",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error deleting comment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const restoreComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to restore comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to restore comments",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      // Get comment data first to update counters
      const commentDoc = await getDoc(commentRef)
      if (!commentDoc.exists()) {
        setError('Comment not found')
        toast({
          title: "Comment Not Found",
          description: "The comment you're trying to restore doesn't exist",
          variant: "destructive"
        })
        return false
      }

      const commentData = commentDoc.data()
      const projectId = commentData.projectId
      const parentCommentId = commentData.parentCommentId

      // Restore the comment
      await updateDoc(commentRef, {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: serverTimestamp()
      })

      // Update project's comment count
      if (projectId) {
        await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
          commentsCount: increment(1),
          updatedAt: serverTimestamp()
        })
      }

      // If this is a reply, update the parent comment's replies count
      if (parentCommentId) {
        await updateDoc(doc(db, COLLECTIONS.COMMENTS, parentCommentId), {
          repliesCount: increment(1),
          updatedAt: serverTimestamp()
        })
      }

      // Update user's comment count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        commentsCount: increment(1),
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Comment Restored",
        description: "Comment has been restored successfully",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to restore comment'
      setError(errorMessage)
      
      toast({
        title: "Error Restoring Comment",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error restoring comment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteComment,
    restoreComment,
    loading,
    error
  }
}
