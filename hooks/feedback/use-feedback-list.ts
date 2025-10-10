"use client"

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'
import { Feedback } from '@/types'

export function useFeedbackList(options?: { realtime?: boolean; approvedOnly?: boolean }) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { realtime = false, approvedOnly = true } = options || {}

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query
        let q = query(
          collection(db, COLLECTIONS.FEEDBACK),
          orderBy('createdAt', 'desc')
        )

        if (approvedOnly) {
          q = query(
            collection(db, COLLECTIONS.FEEDBACK),
            where('approved', '==', true),
            orderBy('createdAt', 'desc')
          )
        }

        if (realtime) {
          // Real-time listener
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const feedback = snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                  id: doc.id,
                  userId: data.userId,
                  userName: data.userName,
                  userAvatar: data.userAvatar,
                  userEmail: data.userEmail,
                  rating: data.rating,
                  comment: data.comment,
                  projectId: data.projectId,
                  projectTitle: data.projectTitle,
                  approved: data.approved,
                  featured: data.featured,
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate() || new Date()
                } as Feedback
              })
              setFeedbackList(feedback)
              setLoading(false)
            },
            (err) => {
              console.error('Error loading feedback:', err)
              setError(err.message || 'Failed to load feedback')
              setLoading(false)
            }
          )

          return unsubscribe
        } else {
          // One-time fetch
          const snapshot = await getDocs(q)
          const feedback = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              userId: data.userId,
              userName: data.userName,
              userAvatar: data.userAvatar,
              userEmail: data.userEmail,
              rating: data.rating,
              comment: data.comment,
              projectId: data.projectId,
              projectTitle: data.projectTitle,
              approved: data.approved,
              featured: data.featured,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as Feedback
          })
          setFeedbackList(feedback)
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error loading feedback:', err)
        setError(err.message || 'Failed to load feedback')
        setLoading(false)
      }
    }

    loadFeedback()
  }, [realtime, approvedOnly])

  return {
    feedbackList,
    loading,
    error
  }
}

