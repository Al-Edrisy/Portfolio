"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, Heart, Flame, Sparkles, Laugh, Lightbulb, Rocket, HandMetal } from 'lucide-react'
import { ReactionType } from '@/types'
import { useAddReaction } from '@/hooks/reactions'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

// Reaction configuration with icons and styling
const reactionConfig = {
  like: { 
    icon: ThumbsUp, 
    label: 'Like',
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    darkBgColor: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:border-blue-800',
    activeColor: 'text-blue-700',
    activeBg: 'bg-blue-100 dark:bg-blue-900/60'
  },
  love: { 
    icon: Heart, 
    label: 'Love',
    color: 'text-red-600', 
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    darkBgColor: 'dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:border-red-800',
    activeColor: 'text-red-700',
    activeBg: 'bg-red-100 dark:bg-red-900/60'
  },
  fire: { 
    icon: Flame, 
    label: 'Fire',
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    darkBgColor: 'dark:bg-orange-950/40 dark:hover:bg-orange-900/50 dark:border-orange-800',
    activeColor: 'text-orange-700',
    activeBg: 'bg-orange-100 dark:bg-orange-900/60'
  },
  wow: { 
    icon: Sparkles, 
    label: 'Wow',
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    darkBgColor: 'dark:bg-yellow-950/40 dark:hover:bg-yellow-900/50 dark:border-yellow-800',
    activeColor: 'text-yellow-700',
    activeBg: 'bg-yellow-100 dark:bg-yellow-900/60'
  },
  laugh: { 
    icon: Laugh, 
    label: 'Laugh',
    color: 'text-green-600', 
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    darkBgColor: 'dark:bg-green-950/40 dark:hover:bg-green-900/50 dark:border-green-800',
    activeColor: 'text-green-700',
    activeBg: 'bg-green-100 dark:bg-green-900/60'
  },
  idea: { 
    icon: Lightbulb, 
    label: 'Idea',
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    darkBgColor: 'dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:border-purple-800',
    activeColor: 'text-purple-700',
    activeBg: 'bg-purple-100 dark:bg-purple-900/60'
  },
  rocket: { 
    icon: Rocket, 
    label: 'Rocket',
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    darkBgColor: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800',
    activeColor: 'text-indigo-700',
    activeBg: 'bg-indigo-100 dark:bg-indigo-900/60'
  },
  clap: { 
    icon: HandMetal, 
    label: 'Clap',
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
    darkBgColor: 'dark:bg-pink-950/40 dark:hover:bg-pink-900/50 dark:border-pink-800',
    activeColor: 'text-pink-700',
    activeBg: 'bg-pink-100 dark:bg-pink-900/60'
  }
}

interface ReactionPickerProps {
  projectId: string
  userReactions?: ReactionType[]
  onReactionChange?: () => void
  className?: string
  compact?: boolean
}

export function ReactionPicker({ 
  projectId, 
  userReactions = [],
  onReactionChange,
  className,
  compact = false
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { addReaction, loading } = useAddReaction()

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
    if (!user) {
      // User needs to sign in
      setIsOpen(false)
      return
    }

    if (loading) return

    // Add or toggle reaction
    const success = await addReaction(projectId, reactionType)
    
    if (success) {
      setIsOpen(false)
      onReactionChange?.()
    }
  }

  const hasReacted = (reactionType: ReactionType) => {
    return userReactions.includes(reactionType)
  }

  return (
    <div ref={pickerRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-gradient-to-r from-blue-500 to-purple-500",
          "text-white font-medium",
          "hover:from-blue-600 hover:to-purple-600",
          "transition-all duration-200",
          "shadow-md hover:shadow-lg",
          compact && "px-3 py-1.5 text-sm"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        <Heart className={cn("w-5 h-5", compact && "w-4 h-4")} />
        <span>{compact ? "React" : "Add Reaction"}</span>
      </motion.button>

      {/* Reaction Picker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
              "bg-white dark:bg-gray-800",
              "rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
              "p-3"
            )}
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />

            {/* Reaction Grid */}
            <div className="relative grid grid-cols-4 gap-2">
              {Object.entries(reactionConfig).map(([type, config]) => {
                const Icon = config.icon
                const reactionType = type as ReactionType
                const isReacted = hasReacted(reactionType)
                const isHovered = hoveredReaction === reactionType

                return (
                  <motion.button
                    key={type}
                    onClick={() => handleReactionClick(reactionType)}
                    onMouseEnter={() => setHoveredReaction(reactionType)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1",
                      "p-3 rounded-xl border",
                      "transition-all duration-200",
                      isReacted ? config.activeBg : config.bgColor,
                      isReacted ? config.darkBgColor : config.darkBgColor,
                      isReacted && "ring-2 ring-offset-1 shadow-md",
                      isReacted && config.color.replace('text-', 'ring-')
                    )}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                  >
                    <Icon className={cn("w-6 h-6", isReacted ? config.activeColor : config.color)} />
                    
                    {/* Label on hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-8 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md whitespace-nowrap"
                        >
                          {config.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Checkmark for reacted */}
                    {isReacted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "absolute -top-1 -right-1",
                          "w-4 h-4 rounded-full",
                          "bg-white dark:bg-gray-800",
                          "flex items-center justify-center",
                          "ring-2",
                          config.color.replace('text-', 'ring-')
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full", config.color.replace('text-', 'bg-'))} />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* User Status */}
            {!user && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Sign in to react
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple reaction button (for quick reactions)
interface QuickReactionButtonProps {
  projectId: string
  reactionType: ReactionType
  isReacted: boolean
  count: number
  onReactionChange?: () => void
}

export function QuickReactionButton({
  projectId,
  reactionType,
  isReacted,
  count,
  onReactionChange
}: QuickReactionButtonProps) {
  const { addReaction, loading } = useAddReaction()
  const { user } = useAuth()
  const config = reactionConfig[reactionType]
  const Icon = config.icon

  const handleClick = async () => {
    if (!user || loading) return
    
    const success = await addReaction(projectId, reactionType)
    if (success) {
      onReactionChange?.()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading || !user}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "transition-all duration-200",
        config.bgColor,
        config.darkBgColor,
        isReacted && "ring-2 ring-offset-1",
        isReacted && config.color.replace('text-', 'ring-'),
        !user && "opacity-50 cursor-not-allowed"
      )}
      whileHover={user ? { scale: 1.05 } : {}}
      whileTap={user ? { scale: 0.95 } : {}}
    >
      <Icon className={cn("w-4 h-4", config.color)} />
      {count > 0 && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {count}
        </span>
      )}
    </motion.button>
  )
}
