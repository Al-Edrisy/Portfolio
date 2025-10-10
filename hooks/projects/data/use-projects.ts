"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  onSnapshot,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Project, ProjectFilters, ProjectSortOptions } from '@/types'
import { getPaginatedProjects, docToProject, getProjectById } from '@/lib/firebase/utils'

const PROJECTS_PER_PAGE = 10

export function useProjects(
  filters: ProjectFilters = {},
  sortOptions: ProjectSortOptions = { field: 'createdAt', direction: 'desc' }
) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null)

  const loadProjects = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoading(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const result = await getPaginatedProjects(
        PROJECTS_PER_PAGE,
        loadMore ? lastDocRef.current : undefined
      )

      if (loadMore) {
        setProjects(prev => [...prev, ...result.projects])
      } else {
        setProjects(result.projects)
      }

      setLastDoc(result.lastDoc)
      lastDocRef.current = result.lastDoc
      setHasMore(result.projects.length === PROJECTS_PER_PAGE)
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Remove lastDoc from dependencies to prevent infinite loop

  const refresh = useCallback(() => {
    setLastDoc(null)
    lastDocRef.current = null
    setHasMore(true)
    loadProjects(false)
  }, [loadProjects])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProjects(true)
    }
  }, [loading, hasMore, loadProjects])

  // Apply filters and sorting
  const filteredProjects = projects.filter(project => {
    // Support both new categories array and legacy category field
    const projectCategories = project.categories || (project.category ? [project.category] : [])
    const matchesCategory = !filters.category || 
      projectCategories.includes(filters.category) ||
      project.category === filters.category // Legacy support
    
    const matchesSearch = !filters.search || 
      project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesPublished = filters.published === undefined || project.published === filters.published
    
    return matchesCategory && matchesSearch && matchesPublished
  })

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aValue = a[sortOptions.field]
    const bValue = b[sortOptions.field]
    
    if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1
    return 0
  })

  useEffect(() => {
    loadProjects(false)
  }, []) // Only run once on mount

  return {
    projects: sortedProjects,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total: projects.length,
  }
}

// Hook for real-time project updates (admin only)
export function useProjectsRealtime() {
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
          console.error('Error loading projects:', err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Failed to load projects')
        console.error('Error in projects listener:', err)
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

// Hook for getting a single project
export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setProject(null)
      setLoading(false)
      return
    }

    const loadProject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch project directly by ID
        const fetchedProject = await getProjectById(projectId)
        
        if (fetchedProject) {
          setProject(fetchedProject)
        } else {
          setError('Project not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project')
        console.error('Error loading project:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  return {
    project,
    loading,
    error,
  }
}

// Hook for getting project categories
export function useProjectCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const snapshot = await getDocs(collection(db, 'projects'))
        const categoriesSet = new Set<string>()
        
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          // Support both new categories array and legacy category field
          const categories = data.categories || (data.category ? [data.category] : [])
          categories.forEach((cat: string) => {
            if (cat) categoriesSet.add(cat)
          })
        })
        
        setCategories(Array.from(categoriesSet).sort())
      } catch (err: any) {
        setError(err.message || 'Failed to load categories')
        console.error('Error loading categories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return {
    categories,
    loading,
    error,
  }
}
