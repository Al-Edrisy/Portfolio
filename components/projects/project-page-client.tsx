"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
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
  Send,
  Eye,
  Code,
  Image as ImageIcon
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
import { ProjectVideoPlayer } from '@/components/projects/project-video-player'
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
  // Handle both new structure (images object) and legacy (image string)
  let projectImages: string[] = []

  if (project.images) {
    if (Array.isArray(project.images)) {
      projectImages = project.images
    } else if (typeof project.images === 'object') {
      // Handle the map structure from Firestore
      const imgs = project.images as any
      const gallery = Array.isArray(imgs.gallery) ? imgs.gallery : []
      const cover = imgs.cover

      // If we have gallery, use it. If cover exists and not in gallery, valid question.
      // Usually gallery includes everything.
      projectImages = gallery.length > 0 ? gallery : (cover ? [cover] : [])
    }
  } else if (project.image) {
    projectImages = [project.image]
  }

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
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-12">

              {/* Project Title & Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(project.categories && project.categories.length > 0
                      ? project.categories
                      : project.category ? [project.category] : []
                    ).map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{project.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {totalReactions} Reactions
                    </span>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-xl">
                  {projectImages.length > 0 ? (
                    <img
                      src={projectImages[currentImageIndex]}
                      alt={project.title}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                      onClick={() => setShowImageModal(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-16 w-16 opacity-20" />
                    </div>
                  )}

                  {/* Image Navigation Overlay */}
                  {projectImages.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between pointer-events-none bg-gradient-to-t from-black/60 to-transparent pt-12">
                      <div className="hidden sm:flex gap-2 pointer-events-auto">
                        {/* Optional: Add small thumbnails here later if needed */}
                      </div>

                      <div className="flex items-center gap-2 pointer-events-auto ms-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 gap-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setShowImageModal(true); }}
                        >
                          <ImageIcon className="h-4 w-4" />
                          View Gallery ({projectImages.length})
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Desktop Arrows */}
                  {projectImages.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="pointer-events-auto bg-background/50 backdrop-blur hover:bg-background/80 h-10 w-10 rounded-full"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="pointer-events-auto bg-background/50 backdrop-blur hover:bg-background/80 h-10 w-10 rounded-full"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Project Description (Case Study Content) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg dark:prose-invert max-w-none"
              >
                <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {project.description}
                </div>
              </motion.div>

              {/* Gallery Grid */}
              {projectImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold mb-6">Project Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectImages.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer group"
                        onClick={() => {
                          setCurrentImageIndex(idx + 1)
                          setShowImageModal(true)
                        }}
                      >
                        <img
                          src={img}
                          alt={`Gallery details ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}



              {/* Video Section */}
              {project.videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  <Separator className="mb-8" />
                  <ProjectVideoPlayer
                    videoUrl={project.videoUrl}
                    title={project.title}
                  />
                </motion.div>
              )}

              <Separator />

              {/* Interactions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reactions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Reactions
                  </h3>
                  <div className="bg-card border rounded-xl p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: 'like' as ReactionType, icon: ThumbsUp, label: 'Like' },
                        { type: 'love' as ReactionType, icon: Heart, label: 'Love' },
                        { type: 'star' as ReactionType, icon: Star, label: 'Star' },
                        { type: 'rocket' as ReactionType, icon: Rocket, label: 'Rocket' },
                      ].map(({ type, icon: Icon, label }) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "flex items-center w-full justify-start gap-2 h-10 px-4 py-2 rounded-md border text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            userReactions.some(r => r.type === type)
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                          )}
                          onClick={() => handleReactionClick(type)}
                          disabled={reactionsLoading}
                        >
                          <Icon className={cn("h-4 w-4", userReactions.some(r => r.type === type) && "animate-bounce")} />
                          <span className="flex-1 text-left">{label}</span>
                          <span className="text-xs bg-muted/20 px-1.5 py-0.5 rounded">
                            {reactionCounts[type] || 0}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Comments */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Discussion ({comments.length})
                  </h3>

                  <div className="space-y-4">
                    {user && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 gap-2 flex">
                          <Textarea
                            placeholder="Share your thoughts..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[40px] h-[40px] resize-none py-2"
                          />
                          <Button
                            size="icon"
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || commentsLoading}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {/* Comments mapping same as before */}
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          No comments yet.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {project.link && (
                    <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20">
                      <a
                        href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.github && (
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <a
                        href={project.github.startsWith('http') ? project.github : `https://${project.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        Source Code
                      </a>
                    </Button>
                  )}
                </div>

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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Tech Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tech?.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div >

      {/* Image Gallery Modal */}
      < ImageGalleryModal
        images={projectImages}
        initialIndex={currentImageIndex}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)
        }
        projectTitle={project.title}
      />
    </>
  )
}