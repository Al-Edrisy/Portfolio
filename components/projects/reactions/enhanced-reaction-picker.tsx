"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ReactionType } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useAddReaction } from '@/hooks/reactions/use-add-reaction'
import { cn } from '@/lib/utils'

// Enhanced reaction configuration with real vibrant emojis
export const REACTION_CONFIG: Record<ReactionType, {
  emoji: string
  label: string
  color: string
  activeBg: string
  borderColor: string
  bgLight: string
}> = {
  like: {
    emoji: '👍',
    label: 'Like',
    color: 'text-blue-500',
    activeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/30',
    bgLight: 'bg-blue-500/10'
  },
  love: {
    emoji: '❤️',
    label: 'Love',
    color: 'text-rose-500',
    activeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/30',
    bgLight: 'bg-rose-500/10'
  },
  fire: {
    emoji: '🔥',
    label: 'Fire',
    color: 'text-amber-500',
    activeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/30',
    bgLight: 'bg-amber-500/10'
  },
  rocket: {
    emoji: '🚀',
    label: 'Rocket',
    color: 'text-indigo-500',
    activeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/30',
    bgLight: 'bg-indigo-500/10'
  },
  idea: {
    emoji: '💡',
    label: 'Idea',
    color: 'text-yellow-500',
    activeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500/30',
    bgLight: 'bg-yellow-500/10'
  },
  clap: {
    emoji: '👏',
    label: 'Clap',
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/30',
    bgLight: 'bg-emerald-500/10'
  },
  laugh: {
    emoji: '😂',
    label: 'Laugh',
    color: 'text-orange-500',
    activeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/30',
    bgLight: 'bg-orange-500/10'
  },
  wow: {
    emoji: '😮',
    label: 'Wow',
    color: 'text-purple-500',
    activeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/30',
    bgLight: 'bg-purple-500/10'
  }
}

export interface EnhancedReactionPickerProps {
  projectId: string
  currentUserReaction?: ReactionType | null
  reactionCounts?: Record<ReactionType, number>
  totalReactions?: number
  onReactionChange?: (reactionType: ReactionType | null) => void
  className?: string
  variant?: 'card' | 'modal' | 'compact'
  showCount?: boolean
}

export default function EnhancedReactionPicker({
  projectId,
  currentUserReaction = null,
  reactionCounts,
  totalReactions,
  onReactionChange,
  className,
  variant = 'card',
  showCount = true
}: EnhancedReactionPickerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addReaction } = useAddReaction()

  const [isOpen, setIsOpen] = useState(false)
  const [isReacting, setIsReacting] = useState(false)

  // Optimistic state
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(currentUserReaction || null)
  const [counts, setCounts] = useState<Record<ReactionType, number>>(reactionCounts || {} as Record<ReactionType, number>)
  const [total, setTotal] = useState<number>(totalReactions || 0)

  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sync with prop updates
  useEffect(() => {
    setActiveReaction(currentUserReaction || null)
  }, [currentUserReaction])

  useEffect(() => {
    if (reactionCounts) {
      setCounts(reactionCounts)
    }
  }, [reactionCounts])

  useEffect(() => {
    if (typeof totalReactions === 'number') {
      setTotal(totalReactions)
    }
  }, [totalReactions])

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    hoverTimerRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 120)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 250)
  }

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to react to projects.",
        variant: "destructive"
      })
      setIsOpen(false)
      return
    }

    if (isReacting) return

    const previousReaction = activeReaction
    const isRemoving = previousReaction === reactionType
    const nextReaction: ReactionType | null = isRemoving ? null : reactionType

    // Optimistic UI updates
    setActiveReaction(nextReaction)
    setTotal(prev => isRemoving ? Math.max(0, prev - 1) : (previousReaction ? prev : prev + 1))
    setCounts(prev => {
      const next = { ...prev }
      if (previousReaction) {
        next[previousReaction] = Math.max(0, (next[previousReaction] || 1) - 1)
      }
      if (!isRemoving) {
        next[reactionType] = (next[reactionType] || 0) + 1
      }
      return next
    })

    onReactionChange?.(nextReaction)
    setIsOpen(false)

    try {
      setIsReacting(true)
      await addReaction(projectId, reactionType)
    } catch (err: any) {
      // Revert optimistic update on failure
      setActiveReaction(previousReaction)
      if (reactionCounts) setCounts(reactionCounts)
      if (typeof totalReactions === 'number') setTotal(totalReactions)
      onReactionChange?.(previousReaction)
      console.error('Failed to update reaction:', err)
    } finally {
      setIsReacting(false)
    }
  }

  // Determine top reacted emoji for unreacted users
  const topReaction = React.useMemo(() => {
    const entries = Object.entries(counts) as [ReactionType, number][]
    const sorted = entries.filter(([_, c]) => c > 0).sort((a, b) => b[1] - a[1])
    return sorted.length > 0 ? sorted[0][0] : null
  }, [counts])

  // Reaction Floating Bar (Emojis + Microcounts)
  const ReactionFloatingBar = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 6 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-full left-0 mb-2 p-1 sm:p-1.5 bg-background/95 dark:bg-card/95 backdrop-blur-xl border border-border/80 rounded-full shadow-2xl z-50 flex items-center gap-0.5 sm:gap-1"
        >
          {Object.entries(REACTION_CONFIG).map(([type, config]) => {
            const isUserReaction = activeReaction === type
            const count = counts[type as ReactionType] || 0

            return (
              <motion.button
                key={type}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReactionClick(type as ReactionType)
                }}
                whileHover={{ scale: 1.35, y: -4 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className={cn(
                  "relative p-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-150 group",
                  isUserReaction
                    ? "bg-muted ring-1 ring-primary/40 shadow-xs scale-105"
                    : "hover:bg-muted/70"
                )}
                title={`${config.label}${count > 0 ? ` (${count})` : ''}`}
              >
                <span className="text-xl sm:text-2xl select-none leading-none">
                  {config.emoji}
                </span>
                {count > 0 && (
                  <span className="text-[9px] font-bold text-muted-foreground mt-0.5 leading-none">
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )

  // 1. Compact Variant (For Project Cards)
  if (variant === 'compact') {
    const displayEmoji = activeReaction 
      ? REACTION_CONFIG[activeReaction].emoji 
      : topReaction 
        ? REACTION_CONFIG[topReaction].emoji 
        : '👍'

    return (
      <div 
        ref={containerRef} 
        className={cn("relative inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => {
            if (activeReaction) {
              handleReactionClick(activeReaction)
            } else {
              setIsOpen(prev => !prev)
            }
          }}
          disabled={isReacting}
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full text-xs font-medium transition-all duration-200 border",
            activeReaction
              ? cn(
                  REACTION_CONFIG[activeReaction].activeBg,
                  "shadow-xs hover:opacity-90 active:scale-95"
                )
              : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60 active:scale-95",
            isReacting && "opacity-60 cursor-not-allowed"
          )}
          title={activeReaction ? `Reacted ${REACTION_CONFIG[activeReaction].label} · Click to remove` : 'Click to react'}
        >
          <span className="text-sm select-none leading-none">
            {displayEmoji}
          </span>
          {showCount && (
            <span className={cn(
              "font-semibold text-xs leading-none",
              activeReaction ? "" : total > 0 ? "text-foreground" : "text-muted-foreground font-normal"
            )}>
              {total > 0 ? total : 'Like'}
            </span>
          )}
        </button>

        {ReactionFloatingBar}
      </div>
    )
  }

  // 2. Standard Card & Modal Variant
  const displayEmoji = activeReaction ? REACTION_CONFIG[activeReaction].emoji : (topReaction ? REACTION_CONFIG[topReaction].emoji : '👍')
  const displayLabel = activeReaction ? REACTION_CONFIG[activeReaction].label : 'React'

  return (
    <div 
      ref={containerRef} 
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isReacting}
        className={cn(
          "flex items-center gap-2 h-9 px-3.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border",
          activeReaction
            ? cn(
                REACTION_CONFIG[activeReaction].activeBg,
                "shadow-xs"
              )
            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60",
          isReacting && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className="text-base select-none">{displayEmoji}</span>
        <span>{displayLabel}</span>
        {showCount && total > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-background/80 text-foreground font-semibold text-xs border border-border/40">
            {total}
          </span>
        )}
      </button>

      {ReactionFloatingBar}
    </div>
  )
}

export { EnhancedReactionPicker }
export const ReactionPicker = EnhancedReactionPicker
