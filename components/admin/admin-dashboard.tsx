"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Crown,
  TrendingUp,
  MessageSquare,
  Heart,
  Eye,
  EyeOff
} from 'lucide-react'
import { useProjectsRealtime } from '@/hooks/projects'
import { useAllReactions } from '@/hooks/reactions'
import { useAllComments } from '@/hooks/comments'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Get real-time data
  const { projects, loading: projectsLoading } = useProjectsRealtime()
  const { reactions, loading: reactionsLoading } = useAllReactions()
  const { comments, loading: commentsLoading } = useAllComments()

  // Calculate statistics
  const totalProjects = projects.length
  const publishedProjects = projects.filter(p => p.published).length
  const draftProjects = projects.filter(p => !p.published).length
  const totalReactions = reactions.length
  const totalComments = comments.length

  // Get most popular project
  const mostPopularProject = projects.reduce((prev, current) => {
    const prevReactions = Object.values(prev.reactionsCount).reduce((sum, count) => sum + count, 0)
    const currentReactions = Object.values(current.reactionsCount).reduce((sum, count) => sum + count, 0)
    return currentReactions > prevReactions ? current : prev
  }, projects[0])

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentProjects = projects.filter(p => p.createdAt > sevenDaysAgo).length
  const recentReactions = reactions.filter(r => r.createdAt > sevenDaysAgo).length
  const recentComments = comments.filter(c => c.createdAt > sevenDaysAgo).length

  const handleCreateProject = () => {
    router.push('/admin/projects/new')
  }

  const handleManageProjects = () => {
    router.push('/admin/projects')
  }

  const handleManageUsers = () => {
    router.push('/admin/users')
  }

  const handleViewAnalytics = () => {
    router.push('/admin/analytics')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Manage your portfolio and content.
          </p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {publishedProjects} published, {draftProjects} drafts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReactions}</div>
              <p className="text-xs text-muted-foreground">
                +{recentReactions} this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComments}</div>
              <p className="text-xs text-muted-foreground">
                +{recentComments} this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">
                {mostPopularProject?.title || 'No projects yet'}
              </div>
              <p className="text-xs text-muted-foreground">
                {mostPopularProject ? 
                  `${Object.values(mostPopularProject.reactionsCount).reduce((sum, count) => sum + count, 0)} reactions` 
                  : 'No reactions yet'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Latest projects added to your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm">{project.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={project.published ? 'default' : 'secondary'} className="text-xs">
                                {project.published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                                {project.published ? 'Published' : 'Draft'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {project.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleCreateProject}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                  <Button
                    onClick={handleManageProjects}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage All Projects
                  </Button>
                  <Button
                    onClick={handleManageUsers}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    onClick={handleViewAnalytics}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>
                      Manage your portfolio projects
                    </CardDescription>
                  </div>
                  <Button onClick={handleManageProjects}>
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Projects
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Project Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the dedicated projects management page for full control.
                  </p>
                  <Button onClick={handleManageProjects}>
                    Go to Projects Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage users and their permissions
                    </CardDescription>
                  </div>
                  <Button onClick={handleManageUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage user accounts and permissions.
                  </p>
                  <Button onClick={handleManageUsers}>
                    Go to User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      View detailed analytics and insights
                    </CardDescription>
                  </div>
                  <Button onClick={handleViewAnalytics}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed analytics and performance metrics.
                  </p>
                  <Button onClick={handleViewAnalytics}>
                    Go to Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

