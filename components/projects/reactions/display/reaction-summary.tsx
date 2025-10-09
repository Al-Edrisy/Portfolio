"use client"

import { motion } from 'framer-motion'
import { ThumbsUp, Heart, Flame, Sparkles, Laugh, Lightbulb, Rocket, HandMetal } from 'lucide-react'
import { ReactionType } from '@/types'
import { cn } from '@/lib/utils'

// Reaction configuration
const reactionConfig = {
  like: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  love: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  fire: { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  wow: { icon: Sparkles, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  laugh: { icon: Laugh, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  idea: { icon: Lightbulb, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  rocket: { icon: Rocket, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  clap: { icon: HandMetal, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950/30' }
}

interface ReactionSummaryProps {
  reactionsCount: Record<ReactionType, number>
  totalReactions: number
  className?: string
  showLabels?: boolean
  compact?: boolean
}

export function ReactionSummary({ 
  reactionsCount, 
  totalReactions,
  className,
  showLabels = false,
  compact = false
}: ReactionSummaryProps) {
  // Get reactions with counts > 0, sorted by count
  const activeReactions = Object.entries(reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type: type as ReactionType, count }))

  if (activeReactions.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
        No reactions yet
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {activeReactions.slice(0, 3).map(({ type }) => {
          const config = reactionConfig[type]
          const Icon = config.icon
          return (
            <div
              key={type}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                config.bgColor
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", config.color)} />
            </div>
          )
        })}
        {totalReactions > 0 && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
            {totalReactions}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Total Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reactions
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </span>
      </div>

      {/* Reaction List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeReactions.map(({ type, count }) => {
          const config = reactionConfig[type]
          const Icon = config.icon
          const percentage = totalReactions > 0 ? (count / totalReactions) * 100 : 0

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "relative overflow-hidden",
                "rounded-xl p-3",
                "border border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800"
              )}
            >
              {/* Background Progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  "absolute inset-0 opacity-20",
                  config.bgColor
                )}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  config.bgColor
                )}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>

                <div className="flex-1">
                  {showLabels && (
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {type}
                    </div>
                  )}
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {count}
                  </div>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Inline reaction display (for cards)
interface InlineReactionDisplayProps {
  reactionsCount: Record<ReactionType, number>
  totalReactions: number
  className?: string
  maxDisplay?: number
}

export function InlineReactionDisplay({ 
  reactionsCount, 
  totalReactions,
  className,
  maxDisplay = 5
}: InlineReactionDisplayProps) {
  // Get reactions with counts > 0, sorted by count
  const activeReactions = Object.entries(reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxDisplay)
    .map(([type, count]) => ({ type: type as ReactionType, count }))

  if (activeReactions.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {activeReactions.map(({ type, count }) => {
        const config = reactionConfig[type]
        const Icon = config.icon

        return (
          <div
            key={type}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              config.bgColor
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {count}
            </span>
          </div>
        )
      })}

      {/* Overflow count */}
      {Object.values(reactionsCount).filter(count => count > 0).length > maxDisplay && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          +{Object.values(reactionsCount).filter(count => count > 0).length - maxDisplay} more
        </div>
      )}
    </div>
  )
}
