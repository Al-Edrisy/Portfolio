"use client"

import { useCallback } from 'react'
import { doc, increment, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'

export function useIncrementView() {
  const { user } = useAuth()

  const incrementView = useCallback(async (projectId: string) => {
    if (!projectId) return

    try {
      // Check if this user/session has already viewed this project
      const viewsRef = collection(db, 'views')
      const userId = user?.id || `anonymous-${getSessionId()}`
      
      // Check if view already exists for this user/session
      const q = query(
        viewsRef,
        where('projectId', '==', projectId),
        where('userId', '==', userId)
      )
      
      const viewSnapshot = await getDocs(q)
      
      // If already viewed, don't count again (unique views)
      if (!viewSnapshot.empty) {
        // Use a more descriptive log level
        console.debug('Already viewed this project')
        return
      }

      // Add new view record
      await addDoc(viewsRef, {
        projectId,
        userId,
        viewedAt: new Date(),
      })

      // Increment the project's view count
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        viewsCount: increment(1)
      })

      console.debug('View counted successfully')
    } catch (error) {
      // More specific error handling
      if (error instanceof Error) {
        console.warn('Error incrementing view:', error.message)
      } else {
        console.warn('Unknown error incrementing view:', error)
      }
      // Don't throw - view tracking shouldn't break the app
    }
  }, [user])

  return { incrementView }
}

// Helper function to get or create a session ID
function getSessionId(): string {
  const storageKey = 'portfolio-session-id'
  
  // Check if session ID exists
  let sessionId = sessionStorage.getItem(storageKey)
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(storageKey, sessionId)
  }
  
  return sessionId
}
