"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { LinkedInStyleProjectCardGSAP } from './cards/project-card-gsap'
import { useProjects } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
// Removed: Connection status hooks were causing false positives
// import { useNetworkStatus } from '@/hooks/use-network-status'
// import { useFirebaseConnection } from '@/hooks/use-firebase-connection'
import { Button } from '@/components/ui/button'
import { ProjectCardSkeleton } from '@/components/ui/loading-skeleton'

import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Loader2,
  ChevronUp,
  LayoutGrid,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ModernProjectsList() {
  const router = useRouter()
  const { isDeveloper } = useAuth()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Prevent hydration mismatch and load saved view preference
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('projects-view-mode') as 'grid' | 'list'
      if (savedMode === 'grid' || savedMode === 'list') {
        setViewMode(savedMode)
      }
    }
  }, [])

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects-view-mode', mode)
    }
  }, [])
  // Removed connection status check as it was causing false positives
  // const { isOnline } = useNetworkStatus()
  // const { isConnected, retry } = useFirebaseConnection()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { projects, loading, error, hasMore, loadMore, refresh } = useProjects()

  // Infinite scroll implementation
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore && !loading) {
      setIsLoadingMore(true)
      try {
        await loadMore()
      } finally {
        setIsLoadingMore(false)
      }
    }
  }, [hasMore, isLoadingMore, loading, loadMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [handleLoadMore, hasMore, isLoadingMore, loading])

  // Scroll to top functionality
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sort projects by newest first
  const sortedProjects = useMemo(() => {
    if (!projects) return []

    return [...projects].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [projects])


  const handleEdit = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}/edit`)
  }, [router])

  const handleDelete = useCallback(async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      toast({
        title: "Project deleted",
        description: "The project has been removed successfully.",
      })
      refresh()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast, refresh])

  const handleTogglePublished = useCallback(async (projectId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        published: !currentStatus,
        updatedAt: new Date(),
      })
      toast({
        title: currentStatus ? "Project unpublished" : "Project published",
        description: currentStatus
          ? "The project is now hidden from public view."
          : "The project is now visible to everyone.",
      })
      refresh()
    } catch (error) {
      console.error('Error toggling published status:', error)
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast, refresh])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Failed to load projects</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refresh} className="flex items-center gap-2">
          <Loader2 className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Projects List with Infinite Scroll */}
      <div>
        {loading ? (
          <div className={cn(
            "grid gap-6 w-full mx-auto",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl" 
              : "grid-cols-1 max-w-2xl"
          )}>
            {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Loader2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              No projects have been published yet.
            </p>
          </div>
        ) : (
          <>
            {/* View Mode Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{sortedProjects.length}</span> projects
              </div>
              <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs gap-1.5 transition-all duration-200",
                    viewMode === 'grid'
                      ? "bg-background text-foreground shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Grid View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs gap-1.5 transition-all duration-200",
                    viewMode === 'list'
                      ? "bg-background text-foreground shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List View</span>
                </Button>
              </div>
            </div>

            <div className={cn(
              "grid gap-6 w-full mx-auto",
              viewMode === 'grid'
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl"
                : "grid-cols-1 max-w-2xl"
            )}>
              <AnimatePresence>
                {sortedProjects.map((project, index) => (
                  <LinkedInStyleProjectCardGSAP
                    key={project.id}
                    project={project}
                    index={index}
                    showAdminControls={isClient && isDeveloper}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading more projects...</span>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">Scroll down to load more projects</p>
                  </div>
                )}
              </div>
            )}

            {/* End of results */}
            {!hasMore && sortedProjects.length > 0 && (
              <div className="flex justify-center py-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">You've reached the end!</p>
                  <p className="text-xs">No more projects to load.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={scrollToTop}
              size="sm"
              className="rounded-full shadow-lg"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
