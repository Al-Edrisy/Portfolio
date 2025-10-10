"use client"

import { useState } from 'react'
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'
import { useAuth } from '@/contexts/auth-context'
import { FeedbackFormData, Feedback } from '@/types'

export function useSubmitFeedback() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const submitFeedback = async (feedbackData: FeedbackFormData): Promise<Feedback | null> => {
    if (!user) {
      setError('You must be signed in to submit feedback')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user already submitted feedback
      const existingFeedbackQuery = query(
        collection(db, COLLECTIONS.FEEDBACK),
        where('userId', '==', user.id)
      )
      const existingFeedback = await getDocs(existingFeedbackQuery)

      if (!existingFeedback.empty) {
        setError('You have already submitted feedback. Each user can only submit once.')
        setLoading(false)
        return null
      }

      // Validate rating
      if (feedbackData.rating < 1 || feedbackData.rating > 6) {
        setError('Rating must be between 1 and 6 stars')
        setLoading(false)
        return null
      }

      // Validate comment
      if (feedbackData.comment.length < 10 || feedbackData.comment.length > 500) {
        setError('Comment must be between 10 and 500 characters')
        setLoading(false)
        return null
      }

      // Get project title if projectId is provided
      let projectTitle: string | undefined
      if (feedbackData.projectId) {
        const projectDoc = await getDocs(
          query(collection(db, COLLECTIONS.PROJECTS), where('__name__', '==', feedbackData.projectId))
        )
        if (!projectDoc.empty) {
          projectTitle = projectDoc.docs[0].data().title
        }
      }

      // Prepare feedback document
      const feedbackDoc = {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userEmail: user.email,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        projectId: feedbackData.projectId,
        projectTitle,
        approved: true, // Auto-approve for now, can add moderation later
        featured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Add feedback to Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACK), feedbackDoc)

      const newFeedback: Feedback = {
        id: docRef.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userEmail: user.email,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        projectId: feedbackData.projectId,
        projectTitle,
        approved: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setLoading(false)
      return newFeedback
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      setError(err.message || 'Failed to submit feedback')
      setLoading(false)
      return null
    }
  }

  return {
    submitFeedback,
    loading,
    error
  }
}

