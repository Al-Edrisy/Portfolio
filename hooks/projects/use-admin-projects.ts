"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  onSnapshot,
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Project } from '@/types'
import { docToProject } from '@/lib/firebase/utils'

// Hook for admin to get ALL projects (published and unpublished)
export function useAdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const q = query(
        collection(db, 'projects'),
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
      setError(err.message || 'Failed to load projects')
      console.error('Error loading admin projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    refresh,
  }
}

// Hook for real-time admin project updates
export function useAdminProjectsRealtime() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
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
          setError(err.message || 'Failed to load projects')
          console.error('Error loading admin projects:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load projects')
        console.error('Error in admin projects listener:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return {
    projects,
    loading,
    error,
  }
}
