"use client"

import { useState, memo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Project } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  MessageCircle,
  MoreHorizontal,
  User,
  X,
  Edit,
  Trash2,
  EyeOff,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useProjectReactions } from '@/hooks/reactions'
import { useProjectComments } from '@/hooks/comments'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import EnhancedReactionPicker from '../reactions/enhanced-reaction-picker'
import ReactionList from '../reactions/reaction-list'
import EnhancedCommentSystem from '../comments/enhanced-comment-system'
import { useIncrementView } from '@/hooks/projects'
import { getTechIconOrText } from '@/lib/tech-icon-mapper'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface LinkedInStyleProjectCardProps {
  project: Project
  index: number
  showAdminControls?: boolean
  onTogglePublished?: (projectId: string, currentStatus: boolean) => void
  onEdit?: (projectId: string) => void
  onDelete?: (projectId: string) => void
}

const LinkedInStyleProjectCardGSAP = memo(function LinkedInStyleProjectCardGSAP({ 
  project, 
  index,
  showAdminControls = false,
  onTogglePublished,
  onEdit,
  onDelete
}: LinkedInStyleProjectCardProps) {
  const router = useRouter()
  const { user, isDeveloper } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [showCommentsInline, setShowCommentsInline] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  
  // Refs for GSAP animations
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const techStackRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  
  const { toast } = useToast()
  
  const { 
    reactions, 
    userReactions, 
    reactionCounts, 
    loading: reactionsLoading
  } = useProjectReactions(project.id)
  
  const { 
    comments, 
    loading: commentsLoading, 
  } = useProjectComments(project.id)

  const { incrementView } = useIncrementView()

  // GSAP Scroll-triggered Animations - Optimized
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!cardRef.current) return

    const ctx = gsap.context(() => {
      // Create unified timeline for scroll-triggered reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true, // Only animate once for performance
        }
      })

      // 1. Card fade in + upward motion (reduced duration)
      tl.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }
      )

      // 2. Title reveal
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          '-=0.25'
        )
      }

      // 3. Description reveal
      if (descriptionRef.current) {
        tl.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          '-=0.2'
        )
      }

      // 4. Tech stack sequential reveal (faster stagger)
      if (techStackRef.current) {
        const techItems = techStackRef.current.querySelectorAll('.tech-item')
        if (techItems.length > 0) {
          tl.fromTo(
            techItems,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.03, // Faster sequential appearance
              ease: 'power2.out',
            },
            '-=0.15'
          )
        }
      }

      // 5. Gentle Image Parallax (only on larger screens)
      if (imageRef.current && window.innerWidth > 768) {
        gsap.to(imageRef.current, {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        })
      }
    }, cardRef)

    return () => ctx.revert()
  }, [])

  // Soft Hover Feedback - Memoized for performance
  const handleCardHover = useCallback((isHovering: boolean) => {
    if (!cardRef.current) return
    
    gsap.to(cardRef.current, {
      y: isHovering ? -3 : 0,
      scale: isHovering ? 1.005 : 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProjectClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    try {
      incrementView(project.id).catch(error => {
        console.warn('Failed to increment view:', error)
      })
      
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error handling project click:', error)
    }
  }

  const handleComment = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setShowCommentsInline(!showCommentsInline)
  }
  
  const handleViewAllCommentsInModal = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setShowCommentsModal(true)
  }

  const handleReactionsClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (reactions.length > 0) {
      setShowReactionsModal(true)
    }
  }

  const getCurrentUserReaction = () => {
    return userReactions.length > 0 ? userReactions[0].type : null
  }

  return (
    <div
      ref={cardRef}
      className="group"
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
    >
      <Card 
        className="border-2 border-border rounded-lg bg-card transition-all hover:border-primary/50 hover:shadow-lg will-change-transform overflow-hidden"
      >
        {/* Header - Author Info */}
        <div className="p-3 md:p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-border">
                <AvatarImage src={project.authorAvatar || (isClient ? user?.avatar : null) || '/placeholder-user.jpg'} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">
                    {project.authorName || (isClient ? user?.name : null) || 'Anonymous User'}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    Developer
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  {(project.categories && project.categories.length > 0 
                    ? project.categories 
                    : project.category ? [project.category] : ['Uncategorized']
                  ).slice(0, 3).map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {project.categories && project.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.categories.length - 3}
                    </Badge>
                  )}
                  <span>•</span>
                  <span>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              {isClient && (showAdminControls || isDeveloper) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMoreMenu(!showMoreMenu)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  
                  {/* Admin Menu Dropdown */}
                  {showMoreMenu && (
                    <div
                      ref={moreMenuRef}
                      className="absolute right-0 top-10 z-50 min-w-[200px] bg-background border-[2px] border-border rounded-lg shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(project.id)
                              setShowMoreMenu(false)
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Project
                          </button>
                        )}
                        {onTogglePublished && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onTogglePublished(project.id, project.published || false)
                              setShowMoreMenu(false)
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                          >
                            <EyeOff className="h-4 w-4" />
                            {project.published ? 'Unpublish' : 'Publish'}
                          </button>
                        )}
                        {onDelete && (
                          <>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this project?')) {
                                  onDelete(project.id)
                                }
                                setShowMoreMenu(false)
                              }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Project
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content - Clickable to open project */}
        <div 
          className="px-3 md:px-4 pb-2 cursor-pointer hover:bg-accent/5 transition-colors rounded-lg -mx-1 px-4"
          onClick={handleProjectClick}
        >
          <h3 
            ref={titleRef}
            className="text-base md:text-lg font-semibold text-foreground mb-2 line-clamp-2"
          >
            {project.title}
          </h3>
          
          <p 
            ref={descriptionRef}
            className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3"
          >
            {project.description}
          </p>
        </div>

        {/* Tech Stack - Above Image with Icons - Responsive */}
        {project.tech && project.tech.length > 0 && (
          <div className="px-3 md:px-4 pb-2">
            <div ref={techStackRef} className="flex flex-wrap gap-1.5 md:gap-2">
              {project.tech.slice(0, 6).map((tech, techIndex) => {
                const { iconPath, displayName, hasIcon } = getTechIconOrText(tech)
                
                return (
                  <TooltipProvider key={techIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="tech-item flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">
                          {hasIcon && iconPath ? (
                            <img 
                              src={iconPath} 
                              alt={displayName}
                              loading="lazy"
                              className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain"
                            />
                          ) : null}
                          <span className="text-[10px] md:text-xs font-medium text-primary truncate max-w-[80px] md:max-w-none">
                            {displayName}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{displayName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
              {project.tech.length > 6 && (
                <Badge variant="secondary" className="tech-item text-[10px] px-2 py-1 font-medium bg-muted text-muted-foreground border-0">
                  +{project.tech.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Project Image with Parallax - Optimized with lazy loading */}
        {project.image && (
          <div className="px-3 md:px-4 pb-3 overflow-hidden">
            <div 
              className="relative w-full aspect-video overflow-hidden rounded-lg bg-muted group/image cursor-pointer"
              onClick={handleProjectClick}
            >
              <div ref={imageRef} className="w-full h-full">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
              
              {/* View Project Overlay Hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white text-sm font-medium">Click to view project</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-3 md:px-4 py-2 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={handleReactionsClick}
                    className="hover:underline cursor-pointer transition-colors hover:text-foreground flex items-center gap-1.5"
                  >
                    {Object.entries(reactionCounts)
                      .filter(([_, count]) => count > 0)
                      .slice(0, 3)
                      .map(([type, _], index) => {
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
                        return (
                          <span key={type} className="text-base">
                            {reactionEmojis[type] || '👍'}
                          </span>
                        )
                      })}
                    <span>{Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {Object.entries(reactionCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([type, count]) => {
                        const reactionLabels: Record<string, string> = {
                          like: 'Like',
                          love: 'Love',
                          fire: 'Fire',
                          wow: 'Wow',
                          laugh: 'Laugh',
                          idea: 'Great Idea',
                          rocket: 'Amazing',
                          clap: 'Applause'
                        }
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
                        return (
                          <div key={type} className="flex items-center gap-2">
                            <span>{reactionEmojis[type]}</span>
                            <span className="text-xs">{reactionLabels[type]}: {count}</span>
                          </div>
                        )
                      })}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <button
              onClick={handleComment}
              className="hover:underline cursor-pointer transition-colors hover:text-foreground flex items-center gap-1"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 md:px-4 py-3 md:py-2 border-t border-border relative">
          <div className="flex items-center justify-between gap-3">
            {/* Left side - Reactions and Comment */}
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <EnhancedReactionPicker
                  projectId={project.id}
                  currentUserReaction={getCurrentUserReaction()}
                  variant="compact"
                  onReactionChange={() => {}}
                />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleComment}
                      className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] md:min-h-0"
                    >
                      <MessageCircle className="h-5 w-5 md:h-4 md:w-4" />
                      <span className="sr-only md:not-sr-only md:inline">Comment</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a comment</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            {/* Right side - View Project Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleProjectClick}
              className="flex items-center gap-2 px-4 py-2.5 md:py-2 min-h-[44px] md:min-h-0 bg-primary hover:bg-primary/90"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View Project</span>
              <span className="sm:hidden">View</span>
            </Button>
          </div>
        </div>

        {/* Comments Section - Inline Expandable */}
        {!commentsLoading && comments.length > 0 && !showCommentsInline && (
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="space-y-3">
              {comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={(isClient ? comment.user?.avatar : null) || '/placeholder-user.jpg'} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{(isClient ? comment.user?.name : null) || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-2">{comment.content}</p>
                      {(comment.repliesCount && comment.repliesCount > 0) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleComment()
                          }}
                          className="mt-1 text-xs text-primary hover:underline font-medium"
                        >
                          View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleComment()
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  View all {comments.length} comments
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expanded Comments Section */}
        <AnimatePresence>
          {showCommentsInline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border bg-muted/30 overflow-hidden"
            >
              <div className="px-4 py-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">
                    Comments ({comments.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewAllCommentsInModal()
                      }}
                      className="text-xs"
                    >
                      Open in Modal
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComment()
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <EnhancedCommentSystem
                  projectId={project.id}
                  projectTitle={project.title}
                  projectDescription={project.description}
                  maxDepth={3}
                  showCount={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments ({comments.length})</DialogTitle>
            <DialogDescription>
              {project.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <EnhancedCommentSystem
              projectId={project.id}
              projectTitle={project.title}
              projectDescription={project.description}
              maxDepth={3}
              showCount={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reactions Modal */}
      <Dialog open={showReactionsModal} onOpenChange={setShowReactionsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>All Reactions</DialogTitle>
            <DialogDescription>
              People who reacted to this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <ReactionList
              reactions={reactions}
              loading={reactionsLoading}
              variant="modal"
              maxVisible={10}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export { LinkedInStyleProjectCardGSAP }

