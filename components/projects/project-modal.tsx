"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  X,
  Loader2,
  MessageCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  Globe,
  Image as ImageIcon,
  Github,
  ArrowUpRight,
  Calendar,
  Tag,
  Eye,
  Code2
} from 'lucide-react'
import { useProject } from '@/hooks/projects'
import { useProjectReactions } from '@/hooks/reactions/use-project-reactions'
import EnhancedReactionPicker from './reactions/enhanced-reaction-picker'
import EnhancedCommentSystem from './comments/enhanced-comment-system'
import { cn } from '@/lib/utils'
import { useIncrementView } from '@/hooks/projects'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ProjectModalProps {
  projectId: string
}

export default function ProjectModal({ projectId }: ProjectModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('reactions')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { project, loading, error } = useProject(projectId)
  const { 
    reactions, 
    userReactions, 
    reactionCounts
  } = useProjectReactions(projectId)

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

  const handleClose = () => {
    router.back()
  }

  const getCurrentUserReaction = () => {
    return userReactions.length > 0 ? userReactions[0].type : null
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
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="relative"
        >
          {/* Animated Background Glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Main Content */}
          <div className="relative text-center">
            {/* Spinner Container */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Inner Spinner */}
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary border-r-primary"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Center Icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            
            {/* Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-white text-xl font-semibold mb-2">Loading Project</p>
              <motion.p 
                className="text-white/60 text-sm"
                animate={{
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Please wait...
              </motion.p>
            </motion.div>
          </div>
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
      
      {/* Modal Content - Sidebar Layout */}
      <div className="relative h-full flex items-end md:items-center justify-center md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-7xl bg-background rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden h-[95vh] border-t md:border border-border/50 flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT SIDE - Image Gallery */}
          <div className="relative md:w-1/2 lg:w-3/5 bg-muted/30 flex flex-col h-[40vh] md:h-auto">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-20 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/90 backdrop-blur-sm hover:bg-background h-10 w-10 rounded-full shadow-lg"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
          </div>

            {/* Desktop Close Button */}
            <div className="hidden md:block absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
                className="bg-background/90 backdrop-blur-sm hover:bg-background h-10 w-10 rounded-full shadow-lg"
            onClick={handleClose}
          >
              <X className="h-5 w-5" />
          </Button>
          </div>

            {/* Image Display */}
            <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/80 overflow-hidden group">
              {projectImages.length > 0 ? (
                <>
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={projectImages[currentImageIndex]}
                    alt={project.title}
                    className="w-full h-full object-contain p-2 md:p-4"
                  />
                  
                  {/* Image Navigation */}
                  {projectImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-20 w-20 mb-4 opacity-40" />
                  <p className="text-sm">No images available</p>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {projectImages.length > 1 && (
              <div className="hidden md:block bg-background/95 backdrop-blur-sm border-t border-border p-4">
                <div className="w-full overflow-x-auto scrollbar-hide">
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>
                  <div className="flex gap-2 pb-1">
                    {projectImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all",
                          index === currentImageIndex 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-muted-foreground/30"
                        )}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-primary/10" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-3 text-xs text-muted-foreground">
                  {currentImageIndex + 1} / {projectImages.length}
                  </div>
                </div>
              )}
              
            {/* Mobile Image Counter */}
            {projectImages.length > 1 && (
              <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                {currentImageIndex + 1} / {projectImages.length}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Fixed Sidebar with Scrollable Content */}
          <div className="md:w-1/2 lg:w-2/5 flex flex-col bg-background">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-6 border-b border-border bg-background">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight break-words">
                    {project.title}
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
                </div>
            </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{totalReactions}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>Comments</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              <div className="p-6 space-y-6">
                {/* Description */}
              <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    About This Project
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <Separator />

                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Project Details
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">
                        Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    
                {project.tech && project.tech.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Code2 className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs font-medium">Technologies</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                  {project.tech.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5">
                        {tech}
                      </Badge>
                    ))}
                        </div>
                  </div>
                )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons - Icon Only */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Links</h3>
                  <div className="flex items-center gap-2">
                  {project.link && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild size="icon" className="h-10 w-10 rounded-full">
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Live Project</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  )}
                  {project.github && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild size="icon" variant="outline" className="h-10 w-10 rounded-full">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                      </a>
                    </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Source Code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  )}
              </div>
                </div>

                <Separator />

                {/* Interactions Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/50">
                    <TabsTrigger value="reactions" className="text-xs font-medium">
                      <Heart className="h-3.5 w-3.5 mr-1.5" />
                      Reactions
                    {totalReactions > 0 && (
                        <span className="ml-1.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs">
                        {totalReactions}
                      </span>
                    )}
                  </TabsTrigger>
                    <TabsTrigger value="comments" className="text-xs font-medium">
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Comments
                  </TabsTrigger>
                </TabsList>

                  <TabsContent value="reactions" className="mt-4 space-y-4">
                    {/* Reaction Picker */}
                      <EnhancedReactionPicker
                        projectId={projectId}
                        currentUserReaction={getCurrentUserReaction()}
                        variant="modal"
                        onReactionChange={() => {
                          // Reactions will refresh automatically via the hook
                        }}
                      />

                    {/* People Who Reacted - Compact Display */}
                    {Object.entries(reactionCounts).some(([_, count]) => count > 0) && (
                      <div className="space-y-2.5 pt-4 border-t border-border">
                        {Object.entries(reactionCounts)
                          .filter(([_, count]) => count > 0)
                          .sort(([, a], [, b]) => b - a) // Sort by count, highest first
                          .map(([type, count]) => {
                            const reactionEmojis: Record<string, string> = {
                              like: '👍',
                              love: '❤️',
                              fire: '🔥',
                              wow: '😮',
                              laugh: '😂',
                              idea: '💡',
                              rocket: '🚀',
                              clap: '👏'
                            }
                            
                            // Get users who used this reaction type
                            const usersWithReaction = reactions.filter(r => r.type === type)
                            
                            return (
                              <div key={type} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                                {/* Reaction Emoji */}
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 flex-shrink-0">
                                  <span className="text-lg">{reactionEmojis[type] || '👍'}</span>
                    </div>

                                {/* User Avatars - Stacked */}
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="flex -space-x-2 mr-2">
                                    {usersWithReaction.slice(0, 4).map((reaction) => (
                                      <TooltipProvider key={reaction.id}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Avatar className="h-7 w-7 ring-2 ring-background hover:scale-110 transition-transform cursor-pointer">
                                              <AvatarImage src={reaction.user.avatar} />
                                              <AvatarFallback className="text-xs">
                                                {reaction.user.name[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{reaction.user.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ))}
                                    {count > 4 && (
                                      <div className="h-7 w-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                                        <span className="text-[10px] font-semibold text-muted-foreground">
                                          +{count - 4}
                                        </span>
                                      </div>
                                    )}
                  </div>

                                  {/* Count */}
                                  <span className="text-xs font-medium text-muted-foreground ml-auto">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                  </div>
                    )}
                </TabsContent>

                  <TabsContent value="comments" className="mt-4">
                      <EnhancedCommentSystem
                        projectId={projectId}
                        projectTitle={project?.title}
                        projectDescription={project?.description}
                        maxDepth={3}
                        showCount={true}
                      />
                </TabsContent>
              </Tabs>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}