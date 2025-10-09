"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { LinkedInStyleProjectCard } from './cards/project-card'
import { useProjects } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ChevronDown, Grid, List, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectCardSkeleton } from '@/components/ui/loading-skeleton'
import { PROJECT_CATEGORIES, PROJECT_CATEGORIES_ARRAY } from '@/constants/project-categories'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type ViewMode = 'grid' | 'list'

export function ProjectsList() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const handleEdit = (projectId: string) => {
    router.push(`/admin/projects/${projectId}/edit`)
  }

  const handleDelete = async (projectId: string) => {
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
  }

  const handleTogglePublished = async (projectId: string, currentStatus: boolean) => {
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
  }
  
  const { projects, loading, error, hasMore, loadMore, refresh } = useProjects({
    search: searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  })

  const handleRefresh = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    refresh()
  }

  return (
    <div className="w-full">
      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PROJECT_CATEGORIES_ARRAY.map((categoryKey) => (
                <SelectItem key={categoryKey} value={categoryKey}>
                  {PROJECT_CATEGORIES[categoryKey].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Category: {PROJECT_CATEGORIES[selectedCategory as keyof typeof PROJECT_CATEGORIES]?.label}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6"
        >
          <p className="text-destructive font-medium">Error loading projects</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button onClick={refresh} variant="outline" size="sm" className="mt-3">
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Projects Grid/List */}
      {!loading && projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'No projects have been published yet'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button onClick={handleRefresh} variant="outline">
              Clear Filters
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <LinkedInStyleProjectCard 
                    project={project} 
                    index={index}
                    showAdminControls={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-12"
            >
              <Button
                onClick={loadMore}
                disabled={loading}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Projects
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Results Count */}
          {projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-8 text-sm text-muted-foreground"
            >
              Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              {!hasMore && ' (All projects loaded)'}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

