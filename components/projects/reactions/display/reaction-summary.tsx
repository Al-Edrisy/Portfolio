"use client"

import { motion } from 'motion/react'
import { ReactionType } from '@/types'
import { REACTION_CONFIG } from '../enhanced-reaction-picker'
import { cn } from '@/lib/utils'

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
      <div className={cn("text-xs text-muted-foreground", className)}>
        No reactions yet
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="flex items-center -space-x-1.5">
          {activeReactions.slice(0, 3).map(({ type }) => (
            <span
              key={type}
              className="text-base select-none leading-none drop-shadow-xs"
              title={`${REACTION_CONFIG[type]?.label || type}: ${reactionsCount[type] || 0}`}
            >
              {REACTION_CONFIG[type]?.emoji || '👍'}
            </span>
          ))}
        </div>
        {totalReactions > 0 && (
          <span className="text-xs font-semibold text-muted-foreground ml-1">
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
        <h3 className="text-sm font-semibold text-foreground">
          Reactions
        </h3>
        <span className="text-xs text-muted-foreground">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </span>
      </div>

      {/* Reaction List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {activeReactions.map(({ type, count }) => {
          const config = REACTION_CONFIG[type]
          const percentage = totalReactions > 0 ? (count / totalReactions) * 100 : 0

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "relative overflow-hidden rounded-xl p-2.5 border border-border/60 bg-card/60 backdrop-blur-xs"
              )}
            >
              {/* Background Progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "absolute inset-0 opacity-15",
                  config.bgLight
                )}
              />

              {/* Content */}
              <div className="relative flex items-center gap-2.5">
                <span className="text-2xl select-none leading-none">
                  {config.emoji}
                </span>

                <div className="flex-1 min-w-0">
                  {showLabels && (
                    <div className="text-[11px] font-medium text-muted-foreground truncate">
                      {config.label}
                    </div>
                  )}
                  <div className="text-base font-bold text-foreground">
                    {count}
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground font-medium">
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

// Inline reaction display (for cards / badges)
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
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {activeReactions.map(({ type, count }) => {
        const config = REACTION_CONFIG[type]

        return (
          <div
            key={type}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
              config.activeBg
            )}
          >
            <span className="text-sm select-none leading-none">{config.emoji}</span>
            <span className="text-xs font-semibold">
              {count}
            </span>
          </div>
        )
      })}

      {/* Overflow count */}
      {Object.values(reactionsCount).filter(count => count > 0).length > maxDisplay && (
        <div className="text-xs text-muted-foreground font-medium">
          +{Object.values(reactionsCount).filter(count => count > 0).length - maxDisplay} more
        </div>
      )}
    </div>
  )
}
