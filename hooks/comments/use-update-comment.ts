"use client"

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Comment } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useUpdateComment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const updateComment = async (
    commentId: string, 
    content: string
  ): Promise<Comment | null> => {
    if (!user) {
      setError('User must be authenticated to update comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to update comments",
        variant: "destructive"
      })
      return null
    }

    if (!content.trim()) {
      setError('Comment content cannot be empty')
      toast({
        title: "Invalid Comment",
        description: "Comment content cannot be empty",
        variant: "destructive"
      })
      return null
    }

    if (content.length > 1000) {
      setError('Comment content is too long (maximum 1000 characters)')
      toast({
        title: "Comment Too Long",
        description: "Comment content must be 1000 characters or less",
        variant: "destructive"
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      // Update the comment content
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully",
      })

      // Return updated comment data (simplified for now)
      const updatedComment: Comment = {
        id: commentId,
        projectId: '', // Would need to fetch from Firestore for accurate data
        userId: user.id,
        content: content.trim(),
        createdAt: new Date(), // Would need to fetch from Firestore for accurate timestamp
        updatedAt: new Date(),
        likes: 0, // Would need to fetch from Firestore for accurate count
        repliesCount: 0, // Would need to fetch from Firestore for accurate count
        user: {
          name: user.name,
          avatar: user.avatar
        }
      }

      return updatedComment

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update comment'
      setError(errorMessage)
      
      toast({
        title: "Error Updating Comment",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error updating comment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateComment,
    loading,
    error
  }
}
