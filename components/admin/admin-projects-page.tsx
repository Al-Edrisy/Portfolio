"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Heart
} from 'lucide-react'
import { useProjectsRealtime } from '@/hooks/projects'
import { useToast } from '@/hooks/use-toast'
import { Project } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function AdminProjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  
  const { projects, loading } = useProjectsRealtime()

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && project.published) ||
                         (statusFilter === 'draft' && !project.published)
    
    return matchesSearch && matchesStatus
  })

  const handleTogglePublished = async (projectId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        published: !currentStatus,
        updatedAt: new Date(),
      })
      
      toast({
        title: "Project updated",
        description: `Project ${!currentStatus ? 'published' : 'unpublished'} successfully.`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteDoc(doc(db, 'projects', projectId))
      
      toast({
        title: "Project deleted",
        description: `"${projectTitle}" has been deleted successfully.`,
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = (projectId: string) => {
    router.push(`/admin/projects/${projectId}/edit`)
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Projects</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your portfolio projects
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/admin/projects/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({projects.length})
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('published')}
          >
            Published ({projects.filter(p => p.published).length})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({projects.filter(p => !p.published).length})
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first project.'
                }
              </p>
              <Button onClick={() => router.push('/admin/projects/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Project Image */}
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                        <Badge variant={project.published ? 'default' : 'secondary'}>
                          {project.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {Object.values(project.reactionsCount).reduce((sum, count) => sum + count, 0)} reactions
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {project.commentsCount} comments
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublished(project.id, project.published)}
                      >
                        {project.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProject(project.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

