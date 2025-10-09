"use client"

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Reaction, ReactionType } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'

export function useUserReactions(projectId?: string) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setReactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Build query based on whether projectId is provided
    let reactionsQuery
    if (projectId) {
      // Get user's reactions for a specific project
      reactionsQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('userId', '==', user.id),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      )
    } else {
      // Get all user's reactions
      reactionsQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      )
    }

    const unsubscribe = onSnapshot(
      reactionsQuery,
      (snapshot) => {
        try {
          const reactionsData: Reaction[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              projectId: data.projectId,
              userId: data.userId,
              type: data.type as ReactionType,
              createdAt: data.createdAt?.toDate() || new Date()
            }
          })
          
          setReactions(reactionsData)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load user reactions')
          console.error('Error loading user reactions:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load user reactions')
        console.error('Error in user reactions listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, projectId])

  // Helper function to check if user has a specific reaction type on a project
  const hasReaction = (projectId: string, reactionType: ReactionType): boolean => {
    return reactions.some(reaction => 
      reaction.projectId === projectId && reaction.type === reactionType
    )
  }

  // Helper function to get all reaction types for a specific project
  const getProjectReactions = (projectId: string): ReactionType[] => {
    return reactions
      .filter(reaction => reaction.projectId === projectId)
      .map(reaction => reaction.type)
  }

  // Helper function to get reaction count by type for a specific project
  const getProjectReactionCounts = (projectId: string): Record<ReactionType, number> => {
    const projectReactions = reactions.filter(reaction => reaction.projectId === projectId)
    
    const counts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      fire: 0,
      wow: 0,
      laugh: 0,
      idea: 0,
      rocket: 0,
      clap: 0
    }

    projectReactions.forEach(reaction => {
      counts[reaction.type]++
    })

    return counts
  }

  // Helper function to get total reaction count for a specific project
  const getProjectTotalReactions = (projectId: string): number => {
    return reactions.filter(reaction => reaction.projectId === projectId).length
  }

  // Helper function to get recent reactions (last N days)
  const getRecentReactions = (days: number = 7): Reaction[] => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return reactions.filter(reaction => reaction.createdAt >= cutoffDate)
  }

  // Helper function to get reactions by type
  const getReactionsByType = (reactionType: ReactionType): Reaction[] => {
    return reactions.filter(reaction => reaction.type === reactionType)
  }

  // Helper function to get most used reaction type
  const getMostUsedReactionType = (): ReactionType | null => {
    if (reactions.length === 0) return null

    const counts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      fire: 0,
      wow: 0,
      laugh: 0,
      idea: 0,
      rocket: 0,
      clap: 0
    }

    reactions.forEach(reaction => {
      counts[reaction.type]++
    })

    return Object.entries(counts).reduce((mostUsed, [type, count]) => 
      count > counts[mostUsed] ? type as ReactionType : mostUsed
    ) as ReactionType
  }

  return {
    reactions,
    loading,
    error,
    hasReaction,
    getProjectReactions,
    getProjectReactionCounts,
    getProjectTotalReactions,
    getRecentReactions,
    getReactionsByType,
    getMostUsedReactionType
  }
}
