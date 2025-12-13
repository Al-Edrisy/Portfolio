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
import { ImageGalleryModal } from '../gallery/image-gallery-modal'
import { SmartImageGrid } from '../gallery/smart-image-grid'


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
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

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

  // Handler to open lightbox at specific image index
  const handleImageClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setLightboxIndex(index)
    setShowLightbox(true)
  }, [])

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
        <div className="p-2.5 md:p-3 pb-1.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage src={project.authorAvatar || (isClient ? user?.avatar : null) || '/placeholder-user.jpg'} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-sm text-foreground">
                    {project.authorName || (isClient ? user?.name : null) || 'Anonymous User'}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Dev
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
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

        {/* Content - Static (View Details button handles navigation) */}
        <div
          className="px-2.5 md:px-3 pb-1.5 rounded-lg"
        >
          <h3
            ref={titleRef}
            className="text-sm md:text-base font-semibold text-foreground mb-1 line-clamp-1"
          >
            {project.title}
          </h3>

          <p
            ref={descriptionRef}
            className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2"
          >
            {project.description}
          </p>
        </div>

        {/* Tech Stack - Above Image with Icons - Responsive */}
        {project.tech && project.tech.length > 0 && (
          <div className="px-2.5 md:px-3 pb-1.5">
            <div ref={techStackRef} className="flex flex-wrap gap-1">
              {project.tech.slice(0, 4).map((tech, techIndex) => {
                const { iconPath, displayName, hasIcon } = getTechIconOrText(tech)

                return (
                  <Tooltip key={techIndex}>
                    <TooltipTrigger asChild>
                      <div className="tech-item flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">
                        {hasIcon && iconPath ? (
                          <img
                            src={iconPath}
                            alt={displayName}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-3 h-3 object-contain"
                          />
                        ) : null}
                        <span className="text-[9px] font-medium text-primary truncate max-w-[60px]">
                          {displayName}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{displayName}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
              {project.tech.length > 4 && (
                <Badge variant="secondary" className="tech-item text-[9px] px-1.5 py-0.5 font-medium bg-muted text-muted-foreground border-0">
                  +{project.tech.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Project Images Gallery - Display all images with error handling */}
        {(project.image || project.images?.gallery?.length) && (
          <div className="px-2.5 md:px-3 pb-2 overflow-hidden">
            <SmartImageGrid
              images={project.images?.gallery || [project.image].filter(Boolean) as string[]}
              projectTitle={project.title}
              onImageClick={handleImageClick}
              imageRef={imageRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        )}

        {/* Actions Row - Consolidate Stats and Actions */}
        <div className="px-3 md:px-4 py-3 border-t border-border flex items-center justify-between gap-3">
          {/* Left: Interactive Actions */}
          <div className="flex items-center gap-1">
            {/* Reaction Picker */}
            <EnhancedReactionPicker
              projectId={project.id}
              currentUserReaction={getCurrentUserReaction()}
              variant="compact"
              onReactionChange={() => { }}
            />

            {/* Comment Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComment}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 h-9 rounded-full hover:bg-muted font-normal text-muted-foreground hover:text-foreground transition-colors",
                    showCommentsInline && "bg-muted text-foreground"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{comments.length > 0 ? comments.length : 'Comment'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View comments</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: View Details */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProjectClick}
                className="flex items-center gap-1.5 px-3 py-2 h-9 rounded-full hover:bg-muted font-normal text-muted-foreground hover:text-primary transition-colors group/view"
              >
                <span className="text-xs">View Details</span>
                <Eye className="h-4 w-4 group-hover/view:text-primary transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open project details</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Comments Section - Only show when explicitly expanded */}
        {showCommentsInline && !commentsLoading && (
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="space-y-3">
              {comments.slice(0, 3).map((comment) => (
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
                {showCommentsInline && (
                  <EnhancedCommentSystem
                    projectId={project.id}
                    projectTitle={project.title}
                    projectDescription={project.description}
                    maxDepth={3}
                    showCount={false}
                  />
                )}
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
            {showCommentsModal && (
              <EnhancedCommentSystem
                projectId={project.id}
                projectTitle={project.title}
                projectDescription={project.description}
                maxDepth={3}
                showCount={false}
              />
            )}
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

      {/* Image Gallery Lightbox */}
      <ImageGalleryModal
        images={project.images?.gallery || [project.image].filter(Boolean) as string[]}
        initialIndex={lightboxIndex}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        projectTitle={project.title}
      />
    </div>
  )
})

export { LinkedInStyleProjectCardGSAP }

