"use client"

import { useState } from 'react'
import { collection, addDoc, updateDoc, increment, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ReactionType } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useAddReaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const addReaction = async (projectId: string, reactionType: ReactionType): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to add reactions')
      toast({
        title: "Authentication Required",
        description: "Please sign in to react to projects",
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
      // Check if user already has ANY reaction on this project (single reaction per user)
      const existingReactionQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('projectId', '==', projectId),
        where('userId', '==', user.id)
      )

      const existingReactionSnapshot = await getDocs(existingReactionQuery)
      
      if (!existingReactionSnapshot.empty) {
        const existingReaction = existingReactionSnapshot.docs[0]
        const existingType = existingReaction.data().type as ReactionType
        
        // If user already has this exact reaction type, remove it (toggle off)
        if (existingType === reactionType) {
          await deleteDoc(existingReaction.ref)
          
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
        } else {
          // If user has a different reaction type, update it
          await deleteDoc(existingReaction.ref)
          
          // Decrease the old reaction count
          await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
            [`reactionsCount.${existingType}`]: increment(-1),
            updatedAt: serverTimestamp()
          })
        }
      }

      // Add new reaction
      const reactionDoc = {
        projectId: projectId,
        userId: user.id,
        type: reactionType,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, COLLECTIONS.REACTIONS), reactionDoc)

      // Increase the reaction count for this type
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        [`reactionsCount.${reactionType}`]: increment(1),
        totalReactions: increment(1),
        updatedAt: serverTimestamp()
      })

      // Update user's reaction count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        reactionsGiven: increment(1),
        lastActiveAt: serverTimestamp()
      })

      const actionText = !existingReactionSnapshot.empty ? 'updated' : 'added'
      toast({
        title: "Reaction Updated",
        description: `You ${actionText} your reaction to ${reactionType} for this project.`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add reaction'
      setError(errorMessage)
      
      toast({
        title: "Error Adding Reaction",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error adding reaction:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const addReactionOnly = async (projectId: string, reactionType: ReactionType): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to add reactions')
      toast({
        title: "Authentication Required",
        description: "Please sign in to react to projects",
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
      // Check if user already has a reaction of this type on this project
      const existingReactionQuery = query(
        collection(db, COLLECTIONS.REACTIONS),
        where('projectId', '==', projectId),
        where('userId', '==', user.id),
        where('type', '==', reactionType)
      )

      const existingReactionSnapshot = await getDocs(existingReactionQuery)
      
      if (!existingReactionSnapshot.empty) {
        // User already has this reaction, don't add another
        toast({
          title: "Already Reacted",
          description: `You already reacted with ${reactionType} to this project`,
          variant: "destructive"
        })
        return false
      }

      // Add new reaction
      const reactionDoc = {
        projectId: projectId,
        userId: user.id,
        type: reactionType,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, COLLECTIONS.REACTIONS), reactionDoc)

      // Increase the reaction count for this type
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        [`reactionsCount.${reactionType}`]: increment(1),
        totalReactions: increment(1),
        updatedAt: serverTimestamp()
      })

      // Update user's reaction count
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        reactionsGiven: increment(1),
        lastActiveAt: serverTimestamp()
      })

      toast({
        title: "Reaction Added",
        description: `You reacted with ${reactionType} to this project`,
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add reaction'
      setError(errorMessage)
      
      toast({
        title: "Error Adding Reaction",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error adding reaction:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    addReaction,
    addReactionOnly,
    loading,
    error
  }
}
