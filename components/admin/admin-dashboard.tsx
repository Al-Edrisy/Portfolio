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
  EyeOff,
  Mail,
  Send,
  Briefcase
} from 'lucide-react'
import { useProjectsRealtime } from '@/hooks/projects'
import { useAllReactions } from '@/hooks/reactions'
import { useAllComments } from '@/hooks/comments'
import { useMessagesRealtime } from '@/hooks/messages'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { AdminMessages } from './admin-messages'
import { AdminEmailCenter } from './admin-email-center'
import { AdminCareerSuite } from './admin-career-suite'
import { ProjectAnnouncementModal } from './project-announcement-modal'
import { Project } from '@/types'


export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [announceProject, setAnnounceProject] = useState<Project | null>(null)
  const [isAnnounceOpen, setIsAnnounceOpen] = useState(false)

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
  const { messages } = useMessagesRealtime()
  const unreadMessages = messages.filter(m => !m.read).length

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
      {/* Top Command Bar (3-Tier Ergonomic Zone) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50 dark:border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-foreground/[0.06] text-muted-foreground border border-border/50">
              Control Plane // Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Engineering &amp; Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.name}. Manage projects, outbound email campaigns, and career pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setActiveTab('email-center')}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Email Center
          </Button>
          <Button size="sm" onClick={handleCreateProject}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats — Tabular Numbers, Subtle Alpha Borders, <200ms Stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.02, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="py-4 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects</CardTitle>
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {publishedProjects} published · {draftProjects} drafts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="py-4 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reactions</CardTitle>
              <Heart className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{totalReactions}</div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                +{recentReactions} this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="py-4 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Comments</CardTitle>
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{totalComments}</div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                +{recentComments} this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.11, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="py-4 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unread Inbox</CardTitle>
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{unreadMessages}</div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                of {messages.length} total messages
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="py-4 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Case Study</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-sm font-semibold truncate">
                {mostPopularProject?.title || 'No projects yet'}
              </div>
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="messages">Inbox ({unreadMessages})</TabsTrigger>
          <TabsTrigger value="email-center" className="flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Email Center
          </TabsTrigger>
          <TabsTrigger value="career-suite" className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Career & Jobs AI
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
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
                          onClick={() => router.push(`/projects/${project.id}/edit`)}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
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
                    onClick={() => setActiveTab('email-center')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Email Center & Bulk Campaigns
                  </Button>
                  <Button
                    onClick={() => setActiveTab('career-suite')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    AI Job Application Suite
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
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
              <CardContent className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Use the dedicated projects management page for full control.
                    </p>
                    <Button onClick={handleManageProjects}>
                      Go to Projects Management
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50 rounded-lg border border-border/50">
                    {projects.map(proj => (
                      <div
                        key={proj.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">{proj.title}</span>
                            <Badge variant={proj.published ? 'default' : 'secondary'} className="text-[11px]">
                              {proj.published ? 'Published' : 'Draft'}
                            </Badge>
                            {proj.published && (
                              <Badge variant="outline" className="text-[11px]">
                                {proj.announcedAt ? 'Announced' : 'Not Announced'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {proj.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {proj.published && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnnounceProject(proj)
                                setIsAnnounceOpen(true)
                              }}
                            >
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              {proj.announcedAt ? 'Re-Announce' : 'Announce'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/projects/${proj.id}/edit`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>
                  Read and manage emails from your portfolio contact form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminMessages />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Administrative Email Center Tab */}
        <TabsContent value="email-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          >
            <AdminEmailCenter />
          </motion.div>
        </TabsContent>

        {/* Personal AI-Assisted Job Application Suite Tab */}
        <TabsContent value="career-suite">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          >
            <AdminCareerSuite />
          </motion.div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
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

      <ProjectAnnouncementModal
        project={announceProject}
        open={isAnnounceOpen}
        onOpenChange={setIsAnnounceOpen}
      />
    </div>
  )
}

