"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Project } from '@/types'
import { docToProject } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'

// Hook for users to get their own projects
export function useUserProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const q = query(
        collection(db, 'projects'),
        where('authorId', '==', user.id),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const projectsData = await Promise.all(
        snapshot.docs.map(async (projectDoc) => {
          const project = docToProject(projectDoc)
          
          // Get reactions count
          const reactionsSnapshot = await getDocs(
            query(collection(db, 'reactions'), where('projectId', '==', projectDoc.id))
          )
          
          const reactionsCount = reactionsSnapshot.docs.reduce((acc, reactionDoc) => {
            const type = reactionDoc.data().type
            acc[type] = (acc[type] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          // Get comments count
          const commentsSnapshot = await getDocs(
            query(collection(db, 'comments'), where('projectId', '==', projectDoc.id))
          )

          return {
            ...project,
            reactionsCount,
            commentsCount: commentsSnapshot.size,
          }
        })
      )
      
      setProjects(projectsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load your projects')
      console.error('Error loading user projects:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const refresh = useCallback(() => {
    loadUserProjects()
  }, [loadUserProjects])

  useEffect(() => {
    loadUserProjects()
  }, [loadUserProjects])

  return {
    projects,
    loading,
    error,
    refresh,
  }
}

// Hook for real-time user project updates
export function useUserProjectsRealtime() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setProjects([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'projects'),
      where('authorId', '==', user.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const projectsData = await Promise.all(
            snapshot.docs.map(async (projectDoc) => {
              const project = docToProject(projectDoc)
              
              // Get reactions count
              const reactionsSnapshot = await getDocs(
                query(collection(db, 'reactions'), where('projectId', '==', projectDoc.id))
              )
              
              const reactionsCount = reactionsSnapshot.docs.reduce((acc, reactionDoc) => {
                const type = reactionDoc.data().type
                acc[type] = (acc[type] || 0) + 1
                return acc
              }, {} as Record<string, number>)

              // Get comments count
              const commentsSnapshot = await getDocs(
                query(collection(db, 'comments'), where('projectId', '==', projectDoc.id))
              )

              return {
                ...project,
                reactionsCount,
                commentsCount: commentsSnapshot.size,
              }
            })
          )
          
          setProjects(projectsData)
          setError(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load your projects')
          console.error('Error loading user projects:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load your projects')
        console.error('Error in user projects listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user?.id])

  return {
    projects,
    loading,
    error,
  }
}
