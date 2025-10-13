"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Calendar, 
  User, 
  Tag,
  AlertCircle,
  Loader2,
  MessageCircle,
  Heart,
  ThumbsUp,
  Star,
  Rocket,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Eye,
  Clock,
  Code,
  Globe,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useProject } from '@/hooks/projects'
import { useProjectReactions } from '@/hooks/reactions/use-project-reactions'
import { useProjectComments } from '@/hooks/comments/use-project-comments'
// Remove this import - we'll use the project reactions hook instead
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Project } from '@/types'
import { ReactionType } from '@/types'
import Navigation from '@/components/ui/navigation'
import { ImageGalleryModal } from '@/components/projects/gallery/image-gallery-modal'
import { HoverPreviewGallery } from '@/components/projects/gallery/hover-preview-gallery'
import { useIncrementView } from '@/hooks/projects'

interface ProjectPageClientProps {
  projectId: string
}

export default function ProjectPageClient({ projectId }: ProjectPageClientProps) {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const { project, loading, error } = useProject(projectId)
  const { 
    reactions, 
    userReactions, 
    reactionCounts, 
    toggleReaction, 
    loading: reactionsLoading 
  } = useProjectReactions(projectId)
  
  const { 
    comments, 
    addComment, 
    loading: commentsLoading 
  } = useProjectComments(projectId)

  const { incrementView } = useIncrementView()

  // Increment view count when page loads
  useEffect(() => {
    if (projectId) {
      incrementView(projectId)
    }
  }, [projectId, incrementView])

  // Handle reaction click with proper functionality
  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to projects.",
        variant: "destructive",
      })
      return
    }

    try {
      await toggleReaction(reactionType)
    } catch (error) {
      console.error('Error handling reaction:', error)
    }
  }

  // Handle comment submission
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


  // Gallery navigation
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Project Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/projects')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle both new structure (images array) and legacy (image)
  const projectImages = project.images && project.images.length > 0 
    ? project.images 
    : project.image 
      ? [project.image] 
      : []
  
  const coverImage = projectImages[0] // First image is always the cover
  const galleryImages = projectImages.slice(1) // Rest are gallery images

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <>
      <Navigation />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Project Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card>
                  <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
                    {projectImages.length > 0 ? (
                      <img
                        src={projectImages[currentImageIndex]}
                        alt={project.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Image Navigation */}
                    {projectImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {projectImages.map((_, index) => (
                            <button
                              key={index}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                index === currentImageIndex 
                                  ? "bg-white" 
                                  : "bg-white/50"
                              )}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <Badge className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm">
                      {project.category}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {isExpanded ? project.description : project.description.substring(0, 200) + (project.description.length > 200 ? '...' : '')}
                        </p>
                        {project.description.length > 200 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-primary hover:text-primary/80 mt-2"
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
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Tabs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="reactions">
                      Reactions ({totalReactions})
                    </TabsTrigger>
                    <TabsTrigger value="comments">
                      Comments ({comments.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Tech Stack */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Technologies Used
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.tech?.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Project Links */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Project Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          {project.link && (
                            <Button asChild className="flex-1">
                              <a href={project.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Live Project
                              </a>
                            </Button>
                          )}
                          {project.github && (
                            <Button asChild variant="outline" className="flex-1">
                              <a href={project.github} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                View Source Code
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Project Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Project Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {totalReactions}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Reactions</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {comments.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Comments</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {project.tech?.length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Technologies</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {projectImages.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Images</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

    {/* Project Images Preview */}
    {projectImages.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Project Images ({projectImages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HoverPreviewGallery
            images={projectImages}
            projectTitle={project.title}
            aspectRatio="video"
            showViewAllButton={true}
          />
        </CardContent>
      </Card>
    )}
                  </TabsContent>

                  <TabsContent value="images">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Project Gallery
                        </CardTitle>
                          {projectImages.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {projectImages.length} {projectImages.length === 1 ? 'image' : 'images'}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {projectImages.length > 0 ? (
                          <HoverPreviewGallery
                            images={projectImages}
                            projectTitle={project.title}
                            aspectRatio="video"
                            showViewAllButton={false}
                            className="max-w-4xl mx-auto"
                          />
                        ) : (
                          <div className="text-center py-16 text-muted-foreground">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-1">No images available</p>
                            <p className="text-sm">This project doesn't have any images yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reactions">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          Reactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Reaction Picker */}
                        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">React to this project:</span>
                          <div className="flex gap-2">
                            {[
                              { type: 'like' as ReactionType, icon: ThumbsUp, label: 'Like' },
                              { type: 'love' as ReactionType, icon: Heart, label: 'Love' },
                              { type: 'star' as ReactionType, icon: Star, label: 'Star' },
                              { type: 'rocket' as ReactionType, icon: Rocket, label: 'Rocket' },
                            ].map(({ type, icon: Icon, label }) => (
                              <Button
                                key={type}
                                variant={userReactions.some(r => r.type === type) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleReactionClick(type)}
                                className="flex items-center gap-1"
                                disabled={reactionsLoading}
                              >
                                <Icon className="h-4 w-4" />
                                {reactionCounts[type] || 0}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Reaction Summary */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Reaction Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(reactionCounts).map(([type, count]) => (
                              <div key={type} className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-lg font-bold text-primary">{count}</div>
                                <div className="text-sm text-muted-foreground capitalize">{type}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="comments">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Comments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add Comment */}
                        {user && (
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {user.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || commentsLoading}
                                    className="flex items-center gap-2"
                                  >
                                    <Send className="h-4 w-4" />
                                    {commentsLoading ? 'Posting...' : 'Comment'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                          {commentsLoading ? (
                            <div className="space-y-4">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3 pb-4 border-b-[2px] border-border last:border-0">
                                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-4 bg-muted rounded animate-pulse w-24" />
                                      <div className="h-3 bg-muted rounded animate-pulse w-16" />
                                    </div>
                                    <div className="h-4 bg-muted rounded animate-pulse w-full" />
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="flex items-center gap-3 pt-2">
                                      <div className="h-6 bg-muted rounded animate-pulse w-12" />
                                      <div className="h-6 bg-muted rounded animate-pulse w-12" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : comments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No comments yet. Be the first to comment!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {comments.map((comment) => (
                                <motion.div
                                  key={comment.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex gap-3"
                                >
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={comment.user.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {comment.user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-foreground">
                                        {comment.user.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {comment.content}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Created</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Categories</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(project.categories && project.categories.length > 0 
                            ? project.categories 
                            : project.category ? [project.category] : ['Uncategorized']
                          ).map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={projectImages}
        initialIndex={currentImageIndex}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        projectTitle={project.title}
      />
    </>
  )
}