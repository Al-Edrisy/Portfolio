"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  X,
  ExternalLink, 
  Github, 
  Calendar, 
  User, 
  Tag,
  Loader2,
  MessageCircle,
  Heart,
  ThumbsUp,
  Star,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Code,
  Globe,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Award,
  ArrowUpRight
} from 'lucide-react'
import { useProject } from '@/hooks/projects'
import { useProjectReactions } from '@/hooks/reactions/use-project-reactions'
import EnhancedReactionPicker from './reactions/enhanced-reaction-picker'
import ReactionList from './reactions/reaction-list'
import { EnhancedCommentForm } from './comments/forms/enhanced-comment-form'
import { useProjectComments } from '@/hooks/comments/use-project-comments'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { ReactionType } from '@/types'
import { useIncrementView } from '@/hooks/projects'

interface ProjectModalProps {
  projectId: string
}

export default function ProjectModal({ projectId }: ProjectModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [startY, setStartY] = useState(0)
  const [deltaY, setDeltaY] = useState(0)

  const { project, loading, error } = useProject(projectId)
  const { 
    reactions, 
    userReactions, 
    reactionCounts, 
    loading: reactionsLoading 
  } = useProjectReactions(projectId)
  
  const { 
    comments, 
    addComment, 
    loading: commentsLoading 
  } = useProjectComments(projectId)

  const { incrementView } = useIncrementView()

  // Increment view count when modal opens
  useEffect(() => {
    if (projectId) {
      incrementView(projectId)
    }
  }, [projectId, incrementView])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Swipe down to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const delta = currentY - startY
    
    // Only allow pulling down from top
    if (delta > 0) {
      setDeltaY(delta)
    }
  }

  const handleTouchEnd = () => {
    // If swiped down more than 150px, close modal
    if (deltaY > 150) {
      handleClose()
    }
    setDeltaY(0)
  }

  const handleClose = () => {
    router.back()
  }

  const getCurrentUserReaction = () => {
    return userReactions.length > 0 ? userReactions[0].type : null
  }

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment on projects.",
        variant: "destructive",
      })
      return
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Invalid comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await addComment(newComment.trim())
      setNewComment('')
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }


  const nextImage = () => {
    if (project?.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === project.images!.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (project?.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images!.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
        </div>
          <p className="text-white/90 text-lg font-medium">Loading project...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Project Not Found</CardTitle>
          </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6 leading-relaxed">
              The project you're looking for doesn't exist or has been removed.
            </p>
              <Button onClick={handleClose} className="w-full h-11">
              Close
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    )
  }

  const projectImages = project.images || (project.image ? [project.image] : [])
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={handleClose}
        aria-label="Close modal"
      />
      
      {/* Modal Content */}
      <div className="relative h-full flex items-end md:items-center justify-center md:p-6">
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: deltaY > 0 ? deltaY : 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full md:max-w-6xl bg-background md:rounded-2xl shadow-2xl overflow-hidden h-[95vh] md:h-auto md:max-h-[95vh] rounded-t-3xl md:rounded-b-2xl border md:border-border/50"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile drag indicator */}
          <div 
            className="md:hidden sticky top-0 z-20 bg-background pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 h-10 w-10"
            onClick={handleClose}
          >
              <X className="h-5 w-5 text-muted-foreground" />
          </Button>
          </div>

          {/* Scrollable Content */}
          <div className="h-full md:max-h-[95vh] overflow-y-auto overscroll-contain">
            {/* Hero Section with Enhanced Visual */}
            <div className="relative h-80 md:h-96 overflow-hidden group">
              {projectImages.length > 0 ? (
                <>
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={projectImages[currentImageIndex]}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Image Navigation */}
                  {projectImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {projectImages.map((_, index) => (
                          <button
                            key={index}
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              index === currentImageIndex 
                                ? "bg-white w-8 shadow-lg" 
                                : "bg-white/50 w-2 hover:bg-white/70"
                            )}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground/70">No preview available</p>
                  </div>
                </div>
              )}
              
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Floating Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-6"
              >
                <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg border-0">
                  <Sparkles className="h-3 w-3 mr-2" />
                {project.category}
              </Badge>
              </motion.div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 right-6 flex gap-3"
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 text-white text-sm">
                  <Eye className="h-4 w-4" />
                  {project.viewsCount || 0}
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 text-white text-sm">
                  <Heart className="h-4 w-4" />
                  {totalReactions}
                </div>
              </motion.div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 md:p-8 space-y-6 pb-safe">
              {/* Project Header with Better Typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 pr-16 md:pr-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {project.title}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                      {isExpanded ? project.description : project.description.substring(0, 250) + (project.description.length > 250 ? '...' : '')}
                    </p>
                    {project.description.length > 250 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Enhanced Tech Stack */}
                {project.tech && project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {project.tech.map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Badge variant="secondary" className="text-sm px-4 py-2 bg-secondary/80 hover:bg-secondary transition-colors">
                          <Code className="h-3 w-3 mr-2" />
                        {tech}
                      </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Enhanced Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                  {project.link && (
                  <Button asChild size="lg" className="flex-1 h-12 text-base font-medium group">
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-5 w-5 mr-2" />
                        View Live Project
                      <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                  {project.github && (
                  <Button asChild variant="outline" size="lg" className="flex-1 h-12 text-base font-medium group border-2">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-5 w-5 mr-2" />
                        View Source Code
                      <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                  )}
              </motion.div>

              {/* Enhanced Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 p-1">
                    <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="reactions" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Heart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Reactions</span>
                    <span className="sm:hidden">React</span>
                      <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {totalReactions}
                      </span>
                  </TabsTrigger>
                    <TabsTrigger value="comments" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Comments</span>
                    <span className="sm:hidden">Chat</span>
                      <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {comments.length}
                      </span>
                  </TabsTrigger>
                </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl border hover:shadow-lg transition-all"
                      >
                        <div className="text-3xl font-bold text-primary mb-2">{totalReactions}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Heart className="h-4 w-4" />
                          Reactions
                        </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl border hover:shadow-lg transition-all"
                      >
                        <div className="text-3xl font-bold text-primary mb-2">{comments.length}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          Comments
                    </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl border hover:shadow-lg transition-all"
                      >
                        <div className="text-3xl font-bold text-primary mb-2">{project.tech?.length || 0}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Code className="h-4 w-4" />
                          Technologies
                    </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl border hover:shadow-lg transition-all"
                      >
                        <div className="text-3xl font-bold text-primary mb-2">{projectImages.length}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          Images
                    </div>
                      </motion.div>
                    </div>

                    {/* Enhanced Project Info */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                  </div>
                      <div>
                          <div className="text-sm font-medium text-foreground">Created</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                            <Clock className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Tag className="h-5 w-5 text-primary" />
                    </div>
                      <div>
                          <div className="text-sm font-medium text-foreground">Category</div>
                        <div className="text-sm text-muted-foreground">{project.category}</div>
                        </div>
                      </div>
                      {project.authorName && (
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Author</div>
                            <div className="text-sm text-muted-foreground">{project.authorName}</div>
                      </div>
                    </div>
                      )}
                  </div>
                </TabsContent>

                  <TabsContent value="reactions" className="space-y-6 mt-6">
                    {/* Enhanced Reaction Picker */}
                    <div className="flex flex-col gap-4 p-6 border-2 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">React to this project</span>
                      </div>
                      <EnhancedReactionPicker
                        projectId={projectId}
                        currentUserReaction={getCurrentUserReaction()}
                        variant="modal"
                        onReactionChange={() => {
                          // Reactions will refresh automatically via the hook
                        }}
                      />
                    </div>

                    {/* Enhanced Reaction Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(reactionCounts).map(([type, count]) => (
                        <motion.div 
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          className="text-center p-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl border hover:shadow-lg transition-all"
                        >
                          <div className="text-2xl font-bold text-primary mb-1">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{type}</div>
                        </motion.div>
                      ))}
                  </div>

                    {/* All Reactions List */}
                    <div className="mt-6">
                      <ReactionList
                        reactions={reactions}
                        loading={reactionsLoading}
                        variant="modal"
                        maxVisible={8}
                      />
                  </div>
                </TabsContent>

                  <TabsContent value="comments" className="space-y-6 mt-6">
                    {/* Enhanced Add Comment */}
                    <EnhancedCommentForm
                      projectId={projectId}
                      onSuccess={() => {
                        setNewComment('')
                      }}
                      placeholder="Share your thoughts about this project..."
                      showRichText={true}
                      className="border-primary/20 bg-gradient-to-br from-muted/30 to-muted/50"
                    />

                    {/* Enhanced Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {commentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                          <p className="text-muted-foreground text-lg">No comments yet</p>
                          <p className="text-muted-foreground/70">Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                            <motion.div 
                              key={comment.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-4 p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border hover:shadow-lg transition-all"
                            >
                              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20">
                              <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback className="text-xs font-semibold">
                                {comment.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold text-foreground">
                                  {comment.user.name}
                                </span>
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                </span>
                              </div>
                                <p className="text-foreground/90 leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                            </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}