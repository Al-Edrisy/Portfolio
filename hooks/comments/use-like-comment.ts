"use client"

import { useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useLikeComment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const toggleLike = async (commentId: string, isLiked: boolean): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to like comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to like comments",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      if (isLiked) {
        // Unlike the comment
        await updateDoc(commentRef, {
          userLikes: arrayRemove(user.id),
          likesCount: increment(-1),
          updatedAt: serverTimestamp()
        })
      } else {
        // Like the comment
        await updateDoc(commentRef, {
          userLikes: arrayUnion(user.id),
          likesCount: increment(1),
          updatedAt: serverTimestamp()
        })
      }

      // Update user's last active timestamp
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        lastActiveAt: serverTimestamp()
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle like'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error toggling like:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const likeComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to like comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to like comments",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      // Like the comment
      await updateDoc(commentRef, {
        userLikes: arrayUnion(user.id),
        likesCount: increment(1),
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Comment Liked",
        description: "You liked this comment",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to like comment'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error liking comment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unlikeComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to unlike comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to unlike comments",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      
      // Unlike the comment
      await updateDoc(commentRef, {
        userLikes: arrayRemove(user.id),
        likesCount: increment(-1),
        updatedAt: serverTimestamp()
      })

      // Update user's last active timestamp
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Comment Unliked",
        description: "You unliked this comment",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unlike comment'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error unliking comment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleLike,
    likeComment,
    unlikeComment,
    loading,
    error
  }
}
