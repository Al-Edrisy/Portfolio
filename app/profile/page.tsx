"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Navigation from '@/components/ui/navigation'
import { UserCursor } from '@/components/ui/custom-cursor'
import { CursorProvider } from '@/components/ui/custom-cursor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  User, 
  Settings, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  Globe, 
  Globe2, 
  BarChart3,
  Calendar,
  Heart,
  MessageCircle,
  ExternalLink,
  Github,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUserProjects } from '@/hooks/projects/use-user-projects'
import { useTogglePublished } from '@/hooks/projects/mutations/use-toggle-published'
import { useDeleteProject } from '@/hooks/projects/mutations'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('activity')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  
  // Check if user can create projects (developer or admin)
  const canCreateProjects = user?.role === 'developer' || user?.role === 'admin'
  
  // Only load projects for developers/admins
  const { projects, loading, refresh } = useUserProjects()
  const { togglePublished } = useTogglePublished()
  const { deleteProject } = useDeleteProject()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
  }, [user, router])

  const handleDeleteAccount = async () => {
    if (!user) return
    
    setIsDeleting(true)
    try {
      // Delete all user's projects first (only for developers/admins)
      if (canCreateProjects && projects.length > 0) {
        for (const project of projects) {
          await deleteProject(project.id)
        }
      }
      
      // Delete user document from Firestore
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await deleteDoc(doc(db, 'users', user.id))
      
      // Delete Firebase Auth account
      const { auth } = await import('@/lib/firebase')
      if (auth.currentUser) {
        await auth.currentUser.delete()
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })
      
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!user) {
    return (
      <CursorProvider>
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Navigation />
          <div className="pt-20">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-4">Redirecting to login...</p>
              </div>
            </div>
          </div>
          <UserCursor />
        </main>
      </CursorProvider>
    )
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

  const publishedProjects = projects.filter(p => p.published)
  const draftProjects = projects.filter(p => !p.published)

  return (
    <CursorProvider>
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                          <p className="text-muted-foreground">{user.email}</p>
                          <Badge variant="secondary" className="mt-1">
                            {user.role === 'admin' ? 'Administrator' : 
                             user.role === 'developer' ? 'Developer' : 'User'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex-1" />
                      
                      <div className="flex items-center gap-4">
                        {canCreateProjects && (
                          <Button
                            onClick={() => router.push('/projects/create')}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create Project
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          className="gap-2"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats Overview - Only for Developers/Admins */}
              {canCreateProjects && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{projects.length}</div>
                        <div className="text-sm text-muted-foreground">Total Projects</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{publishedProjects.length}</div>
                        <div className="text-sm text-muted-foreground">Published</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{draftProjects.length}</div>
                        <div className="text-sm text-muted-foreground">Drafts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {projects.reduce((acc, p) => acc + (p.commentsCount || 0), 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Comments</div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Content based on user role */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {canCreateProjects ? 'My Projects' : 'My Activity'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {canCreateProjects ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">All Projects</TabsTrigger>
                          <TabsTrigger value="published">Published</TabsTrigger>
                          <TabsTrigger value="drafts">Drafts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                          <ProjectList 
                            projects={projects}
                            onTogglePublished={handleTogglePublished}
                            onDelete={handleDeleteProject}
                            onEdit={(id) => router.push(`/projects/${id}/edit`)}
                          />
                        </TabsContent>

                        <TabsContent value="published" className="mt-6">
                          <ProjectList 
                            projects={publishedProjects}
                            onTogglePublished={handleTogglePublished}
                            onDelete={handleDeleteProject}
                            onEdit={(id) => router.push(`/projects/${id}/edit`)}
                          />
                        </TabsContent>

                        <TabsContent value="drafts" className="mt-6">
                          <ProjectList 
                            projects={draftProjects}
                            onTogglePublished={handleTogglePublished}
                            onDelete={handleDeleteProject}
                            onEdit={(id) => router.push(`/projects/${id}/edit`)}
                          />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground mb-4">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Your Activity</h3>
                          <p className="text-sm">You haven't interacted with any projects yet.</p>
                          <p className="text-sm mt-2">Explore projects and leave comments or reactions!</p>
                        </div>
                        <Button onClick={() => router.push('/projects')} className="mt-4">
                          Explore Projects
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
        <UserCursor />

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your account? This action cannot be undone.
                All your data, including {canCreateProjects ? 'projects, ' : ''}comments, and reactions will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </CursorProvider>
  )
}

// Project List Component
function ProjectList({ 
  projects, 
  onTogglePublished, 
  onDelete, 
  onEdit 
}: {
  projects: any[]
  onTogglePublished: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Project Image */}
              <div className="w-full md:w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={project.published ? "default" : "secondary"}>
                      {project.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech?.slice(0, 4).map((tech: string) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.tech?.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tech.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {Object.values(project.reactionsCount || {}).reduce((a: number, b: number) => a + b, 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {project.commentsCount || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 min-w-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(project.id)}
                  className="gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant={project.published ? "default" : "secondary"}
                  onClick={() => onTogglePublished(project.id, project.published)}
                  className="gap-1"
                >
                  {project.published ? (
                    <>
                      <Globe className="w-3 h-3" />
                      Published
                    </>
                  ) : (
                    <>
                      <Globe2 className="w-3 h-3" />
                      Publish
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(project.id)}
                  className="gap-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
