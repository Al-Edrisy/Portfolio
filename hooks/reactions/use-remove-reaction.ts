"use client"

import { useState } from 'react'
import { doc, deleteDoc, updateDoc, increment, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ReactionType } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useRemoveReaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const removeReaction = async (projectId: string, reactionType: ReactionType): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to remove reactions')
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage reactions",
        variant: "destructive"
      })
      return false
    }

    if (!projectId || !reactionType) {
      setError('Project ID and reaction type are required')
      toast({
        title: "Invalid Input",
        description: "Project ID and reaction type are required",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Find the user's reaction of this type on this project
      const reactionQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('projectId', '==', projectId),
        where('userId', '==', user.id),
        where('type', '==', reactionType)
      )

      const reactionSnapshot = await getDocs(reactionQuery)
      
      if (reactionSnapshot.empty) {
        // User doesn't have this reaction
        toast({
          title: "No Reaction Found",
          description: `You don't have a ${reactionType} reaction on this project`,
          variant: "destructive"
        })
        return false
      }

      // Remove the reaction document
      const reactionDoc = reactionSnapshot.docs[0]
      await deleteDoc(reactionDoc.ref)

      // Decrease the reaction count for this type
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        [`reactionsCount.${reactionType}`]: increment(-1),
        totalReactions: increment(-1),
        updatedAt: serverTimestamp()
      })

      // Update user's reaction count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        reactionsGiven: increment(-1),
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Reaction Removed",
        description: `You removed your ${reactionType} reaction`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove reaction'
      setError(errorMessage)
      
      toast({
        title: "Error Removing Reaction",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error removing reaction:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const removeAllReactions = async (projectId: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to remove reactions')
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage reactions",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Find all of the user's reactions on this project
      const reactionsQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('projectId', '==', projectId),
        where('userId', '==', user.id)
      )

      const reactionsSnapshot = await getDocs(reactionsQuery)
      
      if (reactionsSnapshot.empty) {
        // User doesn't have any reactions on this project
        toast({
          title: "No Reactions Found",
          description: "You don't have any reactions on this project",
          variant: "destructive"
        })
        return false
      }

      // Count reactions by type for updating project counters
      const reactionCounts: Record<ReactionType, number> = {
        like: 0,
        love: 0,
        fire: 0,
        wow: 0,
        laugh: 0,
        idea: 0,
        rocket: 0,
        clap: 0
      }

      // Delete all reaction documents and count them
      const deletePromises = reactionsSnapshot.docs.map(async (reactionDoc) => {
        const reactionData = doc.data()
        const reactionType = reactionData.type as ReactionType
        reactionCounts[reactionType]++
        return deleteDoc(doc.ref)
      })

      await Promise.all(deletePromises)

      // Update project counters for each reaction type
      const updatePromises = Object.entries(reactionCounts).map(async ([type, count]) => {
        if (count > 0) {
          return updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
            [`reactionsCount.${type}`]: increment(-count),
            updatedAt: serverTimestamp()
          })
        }
      })

      await Promise.all(updatePromises)

      // Update total reactions count
      const totalRemoved = reactionsSnapshot.size
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        totalReactions: increment(-totalRemoved),
        updatedAt: serverTimestamp()
      })

      // Update user's reaction count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        reactionsGiven: increment(-totalRemoved),
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "All Reactions Removed",
        description: `You removed ${totalRemoved} reaction(s) from this project`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove reactions'
      setError(errorMessage)
      
      toast({
        title: "Error Removing Reactions",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error removing reactions:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    removeReaction,
    removeAllReactions,
    loading,
    error
  }
}
