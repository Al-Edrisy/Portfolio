"use client"

import { useState, memo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Project } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
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
  Eye,
  ExternalLink,
  Github,
  ArrowUpRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useProjectReactions } from '@/hooks/reactions'
import { useProjectComments } from '@/hooks/comments'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import EnhancedReactionPicker from '../reactions/enhanced-reaction-picker'
import EnhancedCommentSystem from '../comments/enhanced-comment-system'
import { useIncrementView } from '@/hooks/projects'
import { getTechIconOrText } from '@/lib/tech-icon-mapper'
import { SmartImageGrid } from '../gallery/smart-image-grid'
import { ProjectVideoPlayer } from '../project-video-player'

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
  viewMode?: 'grid' | 'list'
}

export const LinkedInStyleProjectCardGSAP = memo(function LinkedInStyleProjectCardGSAP({
  project,
  index,
  showAdminControls = false,
  onTogglePublished,
  onEdit,
  onDelete,
  viewMode = 'list'
}: LinkedInStyleProjectCardProps) {
  const { user, isAdmin } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [showCommentsInline, setShowCommentsInline] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Refs for animations
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  const {
    reactions,
    userReactions,
    reactionCounts,
  } = useProjectReactions(project.id)

  const {
    comments,
  } = useProjectComments(project.id)

  const { incrementView } = useIncrementView()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!cardRef.current) return

    const ctx = gsap.context(() => {
      // Gentle Image Parallax (only on desktop)
      if (imageRef.current && window.innerWidth > 768) {
        gsap.to(imageRef.current, {
          yPercent: -4,
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

  // Soft Hover Feedback
  const handleCardHover = useCallback((isHovering: boolean) => {
    if (!cardRef.current) return

    gsap.to(cardRef.current, {
      y: isHovering ? -2 : 0,
      duration: 0.2,
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

  const handleTitleClick = () => {
    incrementView(project.id).catch(error => {
      console.warn('Failed to increment view:', error)
    })
  }

  const getCurrentUserReaction = () => {
    return userReactions.length > 0 ? userReactions[0].type : null
  }

  const description = project.description || ''
  const isLongDescription = description.length > 160

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4) }}
      className="group"
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
    >
      <Card className="border border-border/80 rounded-xl bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-md overflow-hidden">
        {/* Header - Author & Timestamp Info */}
        <div className="p-3.5 md:p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9 ring-1 ring-border/80 shrink-0">
                <AvatarImage src={project.authorAvatar || (isClient ? user?.avatar : null) || '/placeholder-user.jpg'} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {project.authorName ? project.authorName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {project.authorName || 'Salih Ben Otman'}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                    Author
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mt-0.5">
                  {(project.categories && project.categories.length > 0
                    ? project.categories
                    : project.category ? [project.category] : ['Engineering']
                  ).slice(0, 2).map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/60">
                      {cat}
                    </Badge>
                  ))}
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Admin Menu Dropdown */}
            {isClient && (showAdminControls || isAdmin) && (
              <div className="relative shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {showMoreMenu && (
                  <div
                    ref={moreMenuRef}
                    className="absolute right-0 top-9 z-50 min-w-[180px] bg-popover text-popover-foreground border border-border rounded-lg shadow-lg overflow-hidden py-1"
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(project.id)
                          setShowMoreMenu(false)
                        }}
                        className="w-full px-3.5 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Project
                      </button>
                    )}
                    {onTogglePublished && (
                      <button
                        onClick={() => {
                          onTogglePublished(project.id, project.published || false)
                          setShowMoreMenu(false)
                        }}
                        className="w-full px-3.5 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        {project.published ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this project?')) {
                              onDelete(project.id)
                            }
                            setShowMoreMenu(false)
                          }}
                          className="w-full px-3.5 py-2 text-xs text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Project
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content: Title & Inline Expandable Description */}
        <div className="px-3.5 md:px-4 pb-2.5">
          <Link
            href={`/projects/${project.id}`}
            onClick={handleTitleClick}
            className="group/title inline-block mb-1.5"
          >
            <h3 className="text-base font-semibold text-foreground group-hover/title:text-primary transition-colors flex items-center gap-1.5">
              <span>{project.title}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0 transition-all text-primary" />
            </h3>
          </Link>

          {/* Inline "See more / See less" description */}
          <div className="text-sm text-muted-foreground leading-relaxed">
            {isLongDescription && !isDescriptionExpanded ? (
              <p>
                {description.slice(0, 160)}
                <span className="text-muted-foreground">... </span>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(true)}
                  className="font-medium text-foreground hover:text-primary hover:underline transition-colors focus:outline-hidden"
                >
                  see more
                </button>
              </p>
            ) : (
              <div>
                <p className="whitespace-pre-line">{description}</p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="font-medium text-xs text-muted-foreground hover:text-primary mt-1 hover:underline transition-colors focus:outline-hidden block"
                  >
                    see less
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Chips */}
        {project.tech && project.tech.length > 0 && (
          <div className="px-3.5 md:px-4 pb-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              {project.tech.slice(0, 5).map((tech, techIndex) => {
                const { iconPath, displayName, hasIcon } = getTechIconOrText(tech)

                return (
                  <Tooltip key={techIndex}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/60 border border-border/50 text-[11px] font-medium text-secondary-foreground hover:bg-secondary transition-colors cursor-default">
                        {hasIcon && iconPath ? (
                          <img
                            src={iconPath}
                            alt={displayName}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-3.5 h-3.5 object-contain"
                          />
                        ) : null}
                        <span className="truncate max-w-[80px]">
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
              {project.tech.length > 5 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-border/60 text-muted-foreground">
                  +{project.tech.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Media: Video OR Direct Clean Images (No Lightbox/Popup traps) */}
        {project.videoUrl ? (
          <div className="px-3.5 md:px-4 pb-3">
            <ProjectVideoPlayer
              videoUrl={project.videoUrl}
              title={project.title}
              showHeading={false}
            />
          </div>
        ) : (project.image || (project.images && project.images.length > 0)) ? (
          <div className="px-3.5 md:px-4 pb-3">
            <SmartImageGrid
              images={project.images || [project.image].filter(Boolean) as string[]}
              projectTitle={project.title}
              imageRef={imageRef}
            />
          </div>
        ) : null}

        {/* Actions Bar: 1-Click Access (Reactions, Comments, Live Demo, Code) */}
        <div className="px-3.5 md:px-4 py-2.5 border-t border-border/60 bg-muted/15 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Interactions */}
          <div className="flex items-center gap-1.5">
            <EnhancedReactionPicker
              projectId={project.id}
              currentUserReaction={getCurrentUserReaction()}
              variant="compact"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentsInline(!showCommentsInline)}
              className={cn(
                "h-8 px-2.5 rounded-full text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-muted transition-colors gap-1.5",
                showCommentsInline && "bg-muted text-foreground font-medium"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{comments.length > 0 ? comments.length : 'Comment'}</span>
            </Button>
          </div>

          {/* Right: Direct Project Links */}
          <div className="flex items-center gap-1.5 ml-auto">
            {project.link && (
              <Button
                asChild
                size="sm"
                className="h-8 px-3 text-xs gap-1.5 rounded-full font-medium shadow-xs"
              >
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  <span>Live Demo</span>
                </a>
              </Button>
            )}

            {project.github && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs gap-1.5 rounded-full font-normal border-border/80 hover:bg-muted"
              >
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3" />
                  <span>Code</span>
                </a>
              </Button>
            )}

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link href={`/projects/${project.id}`}>
                <span>Details</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Inline Comments System (Expands directly underneath without popups) */}
        <AnimatePresence>
          {showCommentsInline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-t border-border bg-muted/25 overflow-hidden"
            >
              <div className="px-4 py-3.5 max-h-[550px] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                  <h4 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                    Comments ({comments.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentsInline(false)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
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
    </motion.div>
  )
})

export default LinkedInStyleProjectCardGSAP
