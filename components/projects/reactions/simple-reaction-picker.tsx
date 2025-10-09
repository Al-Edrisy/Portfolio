"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ThumbsUp, Heart, Flame, Sparkles, Laugh, Lightbulb, Rocket, HandMetal } from 'lucide-react'
import { ReactionType } from '@/types'
import { useAddReaction } from '@/hooks/reactions'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { REACTION_TYPES } from '@/constants/reaction-types'

// Full reaction configuration with all 8 types + emojis
const reactionConfig = {
  like: { 
    icon: ThumbsUp,
    emoji: REACTION_TYPES.like.emoji,
    label: REACTION_TYPES.like.label,
    color: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400',
    activeColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30'
  },
  love: { 
    icon: Heart,
    emoji: REACTION_TYPES.love.emoji,
    label: REACTION_TYPES.love.label,
    color: 'text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400',
    activeColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30'
  },
  fire: { 
    icon: Flame,
    emoji: REACTION_TYPES.fire.emoji,
    label: REACTION_TYPES.fire.label,
    color: 'text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400',
    activeColor: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30'
  },
  wow: { 
    icon: Sparkles,
    emoji: REACTION_TYPES.wow.emoji,
    label: REACTION_TYPES.wow.label,
    color: 'text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400',
    activeColor: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30'
  },
  laugh: { 
    icon: Laugh,
    emoji: REACTION_TYPES.laugh.emoji,
    label: REACTION_TYPES.laugh.label,
    color: 'text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400',
    activeColor: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30'
  },
  idea: { 
    icon: Lightbulb,
    emoji: REACTION_TYPES.idea.emoji,
    label: REACTION_TYPES.idea.label,
    color: 'text-gray-600 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400',
    activeColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30'
  },
  rocket: { 
    icon: Rocket,
    emoji: REACTION_TYPES.rocket.emoji,
    label: REACTION_TYPES.rocket.label,
    color: 'text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400',
    activeColor: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30'
  },
  clap: { 
    icon: HandMetal,
    emoji: REACTION_TYPES.clap.emoji,
    label: REACTION_TYPES.clap.label,
    color: 'text-gray-600 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400',
    activeColor: 'text-pink-500 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30'
  }
}

interface SimpleReactionPickerProps {
  projectId: string
  userReactions?: ReactionType[]
  onReactionChange?: () => void
  className?: string
  size?: 'sm' | 'md'
}

export function SimpleReactionPicker({ 
  projectId, 
  userReactions = [],
  onReactionChange,
  className,
  size = 'md'
}: SimpleReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { addReaction, loading } = useAddReaction()

  // Update position when opening
  useEffect(() => {
    if (isOpen && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const pickerWidth = 280 // w-[280px]
      const pickerHeight = 200 // estimated height
      
      let top = rect.bottom + 8
      let left = rect.left
      
      // Adjust if would go off screen
      if (left + pickerWidth > viewportWidth - 16) {
        left = viewportWidth - pickerWidth - 16
      }
      if (top + pickerHeight > viewportHeight - 16) {
        top = rect.top - pickerHeight - 8
      }
      
      setPosition({ top, left })
    }
  }, [isOpen])

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user || loading) return

    const success = await addReaction(projectId, reactionType)
    if (success) {
      setIsOpen(false)
      onReactionChange?.()
    }
  }

  const hasReacted = (reactionType: ReactionType) => {
    return userReactions.includes(reactionType)
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const buttonSize = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'

  return (
    <div ref={pickerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border-[2px] border-transparent",
          "hover:border-border transition-colors",
          buttonSize
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
      >
        <Heart className={cn(iconSize)} />
        <span className="text-sm hidden sm:inline">Like</span>
      </motion.button>

      {/* Reaction Picker Dropdown */}
      <AnimatePresence>
        {isOpen && createPortal(
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed z-[99999]",
              "bg-background border-[2px] border-border",
              "rounded-lg shadow-xl",
              "p-3 w-[280px]"
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* Reaction Options - Beautiful 2-column grid */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(reactionConfig).map(([type, config]) => {
                const reactionType = type as ReactionType
                const isReacted = hasReacted(reactionType)

                return (
                  <motion.button
                    key={type}
                    onClick={() => handleReactionClick(reactionType)}
                    className={cn(
                      "flex flex-col items-center gap-2 px-3 py-3 rounded-lg",
                      "transition-all duration-150 relative",
                      "hover:bg-muted",
                      isReacted ? config.bgColor : "bg-background"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      isReacted ? config.activeColor : "text-muted-foreground"
                    )}>
                      {config.label}
                    </span>
                    {isReacted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Sign in prompt */}
            {!user && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Sign in to react
                </p>
              </div>
            )}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  )
}

// Inline reaction display for showing current reactions
interface InlineReactionsProps {
  reactionsCount: Record<ReactionType, number>
  userReactions: ReactionType[]
  onReactionClick?: (reactionType: ReactionType) => void
  className?: string
}

export function InlineReactions({ 
  reactionsCount, 
  userReactions, 
  onReactionClick,
  className 
}: InlineReactionsProps) {
  const totalReactions = Object.values(reactionsCount).reduce((sum, count) => sum + count, 0)
  
  if (totalReactions === 0) {
    return (
      <span className="text-sm text-muted-foreground">0 reactions</span>
    )
  }

  // Get top 3 reactions by count
  const topReactions = Object.entries(reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Emoji bubbles */}
      <div className="flex items-center -space-x-1">
        {topReactions.map(([type]) => {
          const config = reactionConfig[type as ReactionType]
          return (
            <div
              key={type}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-background",
                config.bgColor
              )}
              title={config.label}
            >
              {config.emoji}
            </div>
          )
        })}
      </div>
      
      {/* Total count */}
      <span className="text-sm font-medium text-muted-foreground">
        {totalReactions}
      </span>
    </div>
  )
}
