"use client"

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'
import { useAuth } from '@/contexts/auth-context'

export function useUserFeedbackStatus() {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (!user) {
        setHasSubmitted(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const q = query(
          collection(db, COLLECTIONS.FEEDBACK),
          where('userId', '==', user.id)
        )
        const snapshot = await getDocs(q)
        setHasSubmitted(!snapshot.empty)
      } catch (err) {
        console.error('Error checking feedback status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkFeedbackStatus()
  }, [user])

  return {
    hasSubmitted,
    loading
  }
}

