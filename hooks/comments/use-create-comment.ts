"use client"

import { useState } from 'react'
import { collection, addDoc, updateDoc, increment, serverTimestamp, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Comment, CommentFormData } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useCreateComment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const createComment = async (
    projectId: string, 
    commentData: CommentFormData
  ): Promise<Comment | null> => {
    if (!user) {
      setError('User must be authenticated to create comments')
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive"
      })
      return null
    }

    if (!commentData.content.trim()) {
      setError('Comment content cannot be empty')
      toast({
        title: "Invalid Comment",
        description: "Comment content cannot be empty",
        variant: "destructive"
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate depth for nested comments
      let depth = 0
      if (commentData.parentCommentId) {
        // For replies, we'll set depth to 1 (max depth is 3)
        depth = 1
      }

      // Prepare comment document for Firestore
      const commentDoc = {
        projectId: projectId,
        content: commentData.content.trim(),
        parentCommentId: commentData.parentCommentId || null,
        
        // Author information
        userId: user.id,
        userDisplayName: user.name,
        userAvatar: user.avatar,
        userRole: user.role,
        
        // Comment metadata
        depth: depth,
        repliesCount: 0,
        likesCount: 0,
        userLikes: [], // Array of user IDs who liked this comment
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Soft delete support
        deleted: false
      }

      // Add comment to Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), commentDoc)

      // Update project's comment count
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        commentsCount: increment(1),
        updatedAt: serverTimestamp()
      })

      // If this is a reply, update the parent comment's replies count
      if (commentData.parentCommentId) {
        await updateDoc(doc(db, COLLECTIONS.COMMENTS, commentData.parentCommentId), {
          repliesCount: increment(1),
          updatedAt: serverTimestamp()
        })
      }

      // Update user's comment count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        commentsCount: increment(1),
        lastActiveAt: serverTimestamp()
      })

      // Create the Comment object to return
      const newComment: Comment = {
        id: docRef.id,
        projectId: projectId,
        userId: user.id,
        content: commentData.content.trim(),
        parentCommentId: commentData.parentCommentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        repliesCount: 0,
        user: {
          name: user.name,
          avatar: user.avatar
        }
      }

      toast({
        title: commentData.parentCommentId ? "Reply Posted" : "Comment Posted",
        description: commentData.parentCommentId 
          ? "Your reply has been posted successfully" 
          : "Your comment has been posted successfully",
      })

      return newComment

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create comment'
      setError(errorMessage)
      
      toast({
        title: "Error Posting Comment",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error creating comment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createComment,
    loading,
    error
  }
}
