"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Reaction, ReactionType } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

// Extended reaction type with user information
interface ReactionWithUser extends Reaction {
  user: {
    name: string
    avatar: string
  }
}

// Cache for user data to avoid repeated fetches
const userCache = new Map<string, { name: string; avatar: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useProjectReactions(projectId: string) {
  const [reactions, setReactions] = useState<ReactionWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Function to fetch user data with caching
  const fetchUserData = useCallback(async (userId: string): Promise<{ name: string; avatar: string }> => {
    // Check cache first
    const cached = userCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { name: cached.name, avatar: cached.avatar }
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userInfo = {
          name: userData.name || 'Unknown User',
          avatar: userData.avatar || ''
        }
        
        // Cache the result
        userCache.set(userId, { ...userInfo, timestamp: Date.now() })
        return userInfo
      }
    } catch (error) {
      console.warn(`Failed to fetch user ${userId}:`, error)
    }
    
    return { name: 'Unknown User', avatar: '' }
  }, [])

  // Load reactions with user information
  useEffect(() => {
    if (!projectId) {
      setReactions([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'reactions'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          // Get all reactions
          const reactionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            projectId: doc.data().projectId,
            userId: doc.data().userId,
            type: doc.data().type as ReactionType,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))

          // Get unique user IDs
          const userIds = [...new Set(reactionsData.map(r => r.userId))]
          
          // Fetch user information for all users
          const userPromises = userIds.map(userId => fetchUserData(userId))
          const users = await Promise.all(userPromises)
          
          const usersMap = userIds.reduce((acc, userId, index) => {
            acc[userId] = users[index]
            return acc
          }, {} as Record<string, { name: string; avatar: string }>)

          // Combine reactions with user data
          const reactionsWithUsers = reactionsData.map(reaction => ({
            ...reaction,
            user: usersMap[reaction.userId] || { name: 'Unknown User', avatar: '' }
          }))
          
          setReactions(reactionsWithUsers)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load reactions')
          console.error('Error loading reactions:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load reactions')
        console.error('Error in reactions listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [projectId, fetchUserData])

  // Get user's reactions for this project
  const userReactions = reactions.filter(reaction => reaction.userId === user?.id)

  // Get reaction counts by type
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1
    return acc
  }, {} as Record<ReactionType, number>)

  // Add or update reaction (single reaction per user)
  const addReaction = useCallback(async (type: ReactionType) => {
    if (!user || !projectId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to projects.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user already has any reaction on this project
      const existingReaction = reactions.find(
        r => r.userId === user.id
      )

      if (existingReaction) {
        // If user already has this reaction type, remove it
        if (existingReaction.type === type) {
          await removeReaction(existingReaction.id)
          return
        } else {
          // If user has a different reaction type, update it
          await deleteDoc(doc(db, 'reactions', existingReaction.id))
        }
      }

      // Add new reaction (or updated reaction)
      await addDoc(collection(db, 'reactions'), {
        projectId,
        userId: user.id,
        type,
        createdAt: new Date(),
      })

      const actionText = existingReaction ? 'updated' : 'added'
      toast({
        title: "Reaction updated!",
        description: `You ${actionText} your reaction to ${type} for this project.`,
      })
    } catch (err: any) {
      console.error('Error adding reaction:', err)
      toast({
        title: "Failed to update reaction",
        description: err.message || "An error occurred while updating your reaction.",
        variant: "destructive",
      })
    }
  }, [user, projectId, reactions, toast])

  // Remove reaction
  const removeReaction = useCallback(async (reactionId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your reactions.",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteDoc(doc(db, 'reactions', reactionId))
      
      toast({
        title: "Reaction removed",
        description: "Your reaction has been removed.",
      })
    } catch (err: any) {
      console.error('Error removing reaction:', err)
      toast({
        title: "Failed to remove reaction",
        description: err.message || "An error occurred while removing your reaction.",
        variant: "destructive",
      })
    }
  }, [user, toast])

  // Toggle reaction (single reaction per user, update if different type)
  const toggleReaction = useCallback(async (type: ReactionType) => {
    if (!user || !projectId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to projects.",
        variant: "destructive",
      })
      return
    }

    // Use the new addReaction logic which handles single reaction per user
    await addReaction(type)
  }, [user, projectId, addReaction, toast])

  return {
    reactions,
    userReactions,
    reactionCounts,
    loading,
    error,
    addReaction,
    removeReaction,
    toggleReaction,
  }
}

// Hook for getting all reactions across all projects (admin only)
export function useAllReactions() {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'reactions'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const reactionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            projectId: doc.data().projectId,
            userId: doc.data().userId,
            type: doc.data().type as ReactionType,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
          
          setReactions(reactionsData)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load reactions')
          console.error('Error loading reactions:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load reactions')
        console.error('Error in reactions listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return {
    reactions,
    loading,
    error,
  }
}

// Hook for getting reaction statistics
export function useReactionStats(projectId?: string) {
  const [stats, setStats] = useState<{
    totalReactions: number
    reactionsByType: Record<ReactionType, number>
    topReactions: Array<{ type: ReactionType; count: number }>
  }>({
    totalReactions: 0,
    reactionsByType: {} as Record<ReactionType, number>,
    topReactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)

        let q = query(collection(db, 'reactions'))
        
        if (projectId) {
          q = query(q, where('projectId', '==', projectId))
        }

        const snapshot = await getDocs(q)
        
        const reactionsByType = snapshot.docs.reduce((acc, doc) => {
          const type = doc.data().type as ReactionType
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<ReactionType, number>)

        const totalReactions = snapshot.size
        const topReactions = Object.entries(reactionsByType)
          .map(([type, count]) => ({ type: type as ReactionType, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setStats({
          totalReactions,
          reactionsByType,
          topReactions,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load reaction stats')
        console.error('Error loading reaction stats:', err)
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
