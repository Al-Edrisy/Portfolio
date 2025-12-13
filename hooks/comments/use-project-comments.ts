"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Comment } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useProjectComments(projectId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load comments (only top-level comments, not replies)
  useEffect(() => {
    if (!projectId) {
      setComments([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', projectId),
      where('parentCommentId', '==', null),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const commentsData = await Promise.all(
            snapshot.docs.map(async (commentDoc) => {
              const data = commentDoc.data()

              // Get user data
              const userDoc = await getDoc(doc(db, 'users', data.userId))
              const userData = userDoc.exists() ? userDoc.data() : null

              return {
                id: commentDoc.id,
                projectId: data.projectId,
                userId: data.userId,
                content: data.content,
                parentCommentId: data.parentCommentId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                likes: data.likes,
                userLikes: data.userLikes || [],
                repliesCount: data.repliesCount,
                user: {
                  name: userData?.name || 'Unknown User',
                  avatar: userData?.avatar || '',
                },
              } as Comment
            })
          )

          setComments(commentsData)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load comments')
          console.error('Error loading comments:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load comments')
        console.error('Error in comments listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [projectId])

  // Add comment
  const addComment = useCallback(async (content: string, parentCommentId?: string) => {
    if (!user || !projectId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment on projects.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Invalid comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (content.length > 1000) {
      toast({
        title: "Comment too long",
        description: "Comments must be 1000 characters or less.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentData = {
        projectId,
        userId: user.id,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        userLikes: [],
        repliesCount: 0,
      }

      await addDoc(collection(db, 'comments'), commentData)

      // If this is a reply, increment the parent comment's replies count
      if (parentCommentId) {
        await updateDoc(doc(db, 'comments', parentCommentId), {
          repliesCount: increment(1),
        })
      }

      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully.",
      })
    } catch (err: any) {
      console.error('Error adding comment:', err)
      toast({
        title: "Failed to add comment",
        description: err.message || "An error occurred while posting your comment.",
        variant: "destructive",
      })
    }
  }, [user, projectId, toast])

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit comments.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Invalid comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (content.length > 1000) {
      toast({
        title: "Comment too long",
        description: "Comments must be 1000 characters or less.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user owns this comment
      const comment = comments.find(c => c.id === commentId)
      if (!comment || comment.userId !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only edit your own comments.",
          variant: "destructive",
        })
        return
      }

      await updateDoc(doc(db, 'comments', commentId), {
        content: content.trim(),
        updatedAt: new Date(),
      })

      toast({
        title: "Comment updated!",
        description: "Your comment has been updated successfully.",
      })
    } catch (err: any) {
      console.error('Error updating comment:', err)
      toast({
        title: "Failed to update comment",
        description: err.message || "An error occurred while updating your comment.",
        variant: "destructive",
      })
    }
  }, [user, comments, toast])

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete comments.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user owns this comment or is admin/developer
      const comment = comments.find(c => c.id === commentId)
      if (!comment || (comment.userId !== user.id && user.role !== 'admin' && user.role !== 'developer')) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own comments.",
          variant: "destructive",
        })
        return
      }

      // If this is a top-level comment, we need to delete all replies first
      if (!comment.parentCommentId) {
        const repliesQuery = query(
          collection(db, 'comments'),
          where('parentCommentId', '==', commentId)
        )

        const repliesSnapshot = await getDocs(repliesQuery)
        const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      } else {
        // If this is a reply, decrement the parent comment's replies count
        await updateDoc(doc(db, 'comments', comment.parentCommentId), {
          repliesCount: increment(-1),
        })
      }

      await deleteDoc(doc(db, 'comments', commentId))

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      toast({
        title: "Failed to delete comment",
        description: err.message || "An error occurred while deleting your comment.",
        variant: "destructive",
      })
    }
  }, [user, comments, toast])

  // Get replies for a comment
  const getReplies = useCallback(async (commentId: string): Promise<Comment[]> => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('parentCommentId', '==', commentId),
        orderBy('createdAt', 'asc')
      )

      const snapshot = await getDocs(q)
      const replies = await Promise.all(
        snapshot.docs.map(async (commentDoc) => {
          try {
            const data = commentDoc.data()

            // Get user data safely with error handling
            let userData = null
            try {
              const userDoc = await getDoc(doc(db, 'users', data.userId))
              userData = userDoc.exists() ? userDoc.data() : null
            } catch (userError) {
              console.error('Error fetching user data:', userError)
            }

            return {
              id: commentDoc.id,
              projectId: data.projectId || '',
              userId: data.userId || '',
              content: data.content || '',
              parentCommentId: data.parentCommentId || null,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              likes: data.likes || 0,
              userLikes: data.userLikes || [], // Map userLikes safely
              repliesCount: data.repliesCount || 0,
              user: {
                name: userData?.name || 'Unknown User',
                avatar: userData?.avatar || '',
              },
            } as Comment
          } catch (docError) {
            console.error('Error processing comment document:', docError)
            // Return a default comment object to prevent breaking the entire reply list
            return null
          }
        })
      )

      // Filter out any null values from failed document processing
      return replies.filter((reply): reply is Comment => reply !== null)
    } catch (err: any) {
      console.error('Error getting replies:', err)
      return []
    }
  }, [])

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    getReplies,
  }
}

// Hook for getting all comments across all projects (admin only)
export function useAllComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const commentsData = await Promise.all(
            snapshot.docs.map(async (commentDoc) => {
              const data = commentDoc.data()

              // Get user data
              const userDoc = await getDoc(doc(db, 'users', data.userId))
              const userData = userDoc.exists() ? userDoc.data() : null

              return {
                id: commentDoc.id,
                projectId: data.projectId,
                userId: data.userId,
                content: data.content,
                parentCommentId: data.parentCommentId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                likes: data.likes,
                userLikes: data.userLikes || [],
                repliesCount: data.repliesCount,
                user: {
                  name: userData?.name || 'Unknown User',
                  avatar: userData?.avatar || '',
                },
              } as Comment
            })
          )

          setComments(commentsData)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load comments')
          console.error('Error loading comments:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load comments')
        console.error('Error in comments listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return {
    comments,
    loading,
    error,
  }
}

// Hook for getting comment statistics
export function useCommentStats(projectId?: string) {
  const [stats, setStats] = useState<{
    totalComments: number
    commentsByProject: Record<string, number>
    topCommenters: Array<{ userId: string; name: string; count: number }>
  }>({
    totalComments: 0,
    commentsByProject: {},
    topCommenters: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)

        let q = query(collection(db, 'comments'))

        if (projectId) {
          q = query(q, where('projectId', '==', projectId))
        }

        const snapshot = await getDocs(q)

        const commentsByProject = snapshot.docs.reduce((acc, doc) => {
          const projectId = doc.data().projectId
          acc[projectId] = (acc[projectId] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const commentersCount = snapshot.docs.reduce((acc, doc) => {
          const userId = doc.data().userId
          acc[userId] = (acc[userId] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Get top commenters with their names
        const topCommenters = await Promise.all(
          Object.entries(commentersCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(async ([userId, count]) => {
              const userDoc = await getDoc(doc(db, 'users', userId))
              const userData = userDoc.exists() ? userDoc.data() : null
              return {
                userId,
                name: userData?.name || 'Unknown User',
                count,
              }
            })
        )

        setStats({
          totalComments: snapshot.size,
          commentsByProject,
          topCommenters,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load comment stats')
        console.error('Error loading comment stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [projectId])

  return {
    stats,
    loading,
    error,
  }
}
