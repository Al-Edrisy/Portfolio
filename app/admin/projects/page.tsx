"use client"

import { useAdminProjects } from '@/hooks/projects/use-admin-projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Eye, EyeOff, Trash2, Globe, Globe2 } from 'lucide-react'
import Navigation from '@/components/ui/navigation'
// Custom cursor removed - using default browser cursor
import { useToggleFeatured } from '@/hooks/projects/mutations'
import { useDeleteProject } from '@/hooks/projects/mutations'
import { useTogglePublished } from '@/hooks/projects/mutations/use-toggle-published'

export default function AdminProjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { projects, loading, refresh } = useAdminProjects()
  const { toggleFeatured } = useToggleFeatured()
  const { deleteProject } = useDeleteProject()
  const { togglePublished } = useTogglePublished()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const handleToggleFeatured = async (projectId: string) => {
    await toggleFeatured(projectId)
    refresh()
  }

  const handleTogglePublished = async (projectId: string, currentStatus: boolean) => {
    await togglePublished(projectId, currentStatus)
    refresh()
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(projectId)
      refresh()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading projects...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Manage Projects</h1>
                <p className="text-muted-foreground">
                  Admin panel for managing all projects in the portfolio.
                </p>
              </div>
              <Button onClick={() => router.push('/projects/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>

            {projects && projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-foreground mb-4">No Projects Found</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first project to get started.
                </p>
                <Button onClick={() => router.push('/projects/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    {/* Project Image */}
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{project.description}</p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                        {project.featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tech.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                            {tech}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                            +{project.tech.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/projects/${project.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={project.published ? "default" : "secondary"}
                        onClick={() => handleTogglePublished(project.id, project.published)}
                      >
                        {project.published ? (
                          <>
                            <Globe className="w-4 h-4 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <Globe2 className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={project.featured ? "default" : "secondary"}
                        onClick={() => handleToggleFeatured(project.id)}
                      >
                        {project.featured ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Featured
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Feature
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Reactions: {project.reactionCount || 0}</span>
                        <span>Comments: {project.commentCount || 0}</span>
                      </div>
                      <div className="mt-1">
                        Created: {new Date(project.createdAt?.toDate?.() || project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
  )
}
