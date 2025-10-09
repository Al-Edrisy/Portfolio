"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { LinkedInStyleProjectCard } from './cards/project-card'
import { useProjects } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectCardSkeleton } from '@/components/ui/loading-skeleton'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Loader2,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ModernProjectsList() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
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
    router.push(`/admin/projects/${projectId}/edit`)
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
          <div className="grid gap-6 grid-cols-1 max-w-2xl mx-auto">
            {[...Array(6)].map((_, i) => (
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
            <div className="grid gap-6 grid-cols-1 max-w-2xl mx-auto">
              <AnimatePresence>
                {sortedProjects.map((project, index) => (
                  <LinkedInStyleProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    showAdminControls={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
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
