"use client"

import { useAdminProjects } from '@/hooks/projects/use-admin-projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Eye, EyeOff, Trash2, Globe, Globe2, Send, CheckCircle2 } from 'lucide-react'
import Navigation from '@/components/ui/navigation'
import { ProjectAnnouncementModal } from '@/components/admin/project-announcement-modal'
import { Project } from '@/types'
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
  const [announceProject, setAnnounceProject] = useState<Project | null>(null)
  const [isAnnounceOpen, setIsAnnounceOpen] = useState(false)

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

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean, projectTitle?: string) => {
    await toggleFeatured(projectId, currentFeatured, projectTitle)
    refresh()
  }

  const handleTogglePublished = async (projectId: string, currentStatus: boolean) => {
    const targetProject = projects.find(p => p.id === projectId)
    const ok = await togglePublished(projectId, currentStatus)
    await refresh()

    // If transitioning from Draft (false) -> Published (true) and never announced yet, open announcement review modal
    if (ok && !currentStatus && targetProject && !targetProject.announcedAt) {
      setAnnounceProject({ ...targetProject, published: true })
      setIsAnnounceOpen(true)
    }
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
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border/50">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-8 w-56 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
            </div>
            {/* Progressive geometry-matched skeleton grid (Anti-Slop Manifesto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/50 dark:border-white/[0.08] rounded-2xl p-4 space-y-4"
                >
                  <div className="aspect-video bg-muted/60 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-muted/60 rounded animate-pulse" />
                    <div className="h-3.5 w-full bg-muted/50 rounded animate-pulse" />
                    <div className="h-3.5 w-2/3 bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse" />
                    <div className="h-8 w-24 bg-muted/50 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50 dark:border-white/[0.08]">
              <div>
                <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground mb-1">
                  Repository // Case Studies
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Manage Projects
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Publish technical case studies, manage featured order, and dispatch release announcements.
                </p>
              </div>
              <Button onClick={() => router.push('/projects/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>

            {projects && projects.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card/50 py-16 px-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">No Projects Found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first engineering case study to showcase your architecture and notify subscribers.
                </p>
                <Button onClick={() => router.push('/projects/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  /* Proportional radii math: Outer rounded-2xl (16px) - p-4 (16px) -> Inner rounded-lg (8px) */
                  <div
                    key={project.id}
                    className="bg-card border border-border/60 dark:border-white/[0.08] rounded-2xl p-4 hover:border-border transition-[border-color,box-shadow] duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Project Image */}
                      <div className="aspect-video bg-muted/50 rounded-lg mb-4 overflow-hidden border border-border/40">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            No Cover Asset
                          </div>
                        )}
                      </div>

                      {/* Project Info (Left-aligned per Anti-Slop Manifesto) */}
                      <div className="mb-4 px-1">
                        <h3 className="font-semibold text-base tracking-tight mb-1.5 line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{project.description}</p>
                        
                        {/* Monochromatic & Intentional Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            project.published 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' 
                              : 'bg-muted/60 text-muted-foreground border-border/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${project.published ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`} />
                            {project.published ? 'Published' : 'Draft'}
                          </span>
                          {project.featured && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-foreground/[0.06] text-foreground border border-border/60">
                              Featured
                            </span>
                          )}
                          {project.published && (
                            project.announcedAt ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Announced
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-muted-foreground bg-muted/40 border border-border/40">
                                Unannounced
                              </span>
                            )
                          )}
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.tech.slice(0, 3).map((tech) => (
                            <span key={tech} className="text-[11px] font-mono px-2 py-0.5 bg-muted/50 text-muted-foreground rounded border border-border/40">
                              {tech}
                            </span>
                          ))}
                          {project.tech.length > 3 && (
                            <span className="text-[11px] font-mono px-2 py-0.5 bg-muted/50 text-muted-foreground rounded border border-border/40 tabular-nums">
                              +{project.tech.length - 3}
                            </span>
                          )}
                        </div>
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
                        onClick={() => handleToggleFeatured(project.id, project.featured || false, project.title)}
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

                      {project.published && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAnnounceProject(project)
                            setIsAnnounceOpen(true)
                          }}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          {project.announcedAt ? 'Re-Announce' : 'Announce'}
                        </Button>
                      )}

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
                        <span>Reactions: {Object.values(project.reactionsCount || {}).reduce((a, b) => a + b, 0)}</span>
                        <span>Comments: {project.commentsCount || 0}</span>
                      </div>
                      <div className="mt-1">
                        Created: {project.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ProjectAnnouncementModal
          project={announceProject}
          open={isAnnounceOpen}
          onOpenChange={setIsAnnounceOpen}
          onComplete={() => {
            refresh()
          }}
        />
      </main>
  )
}
