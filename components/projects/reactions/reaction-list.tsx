"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ThumbsUp, 
  Heart, 
  Flame, 
  Sparkles, 
  Laugh, 
  Lightbulb, 
  Rocket, 
  HandMetal,
  ChevronDown,
  ChevronUp,
  Users,
  Eye
} from 'lucide-react'
import { Reaction, ReactionType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// Reaction configuration matching the picker
const reactionConfig = {
  like: { 
    icon: ThumbsUp,
    emoji: '👍',
    label: 'Like',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-950/40'
  },
  love: { 
    icon: Heart,
    emoji: '❤️',
    label: 'Love',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    darkBgColor: 'dark:bg-red-950/40'
  },
  fire: { 
    icon: Flame,
    emoji: '🔥',
    label: 'Fire',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    darkBgColor: 'dark:bg-orange-950/40'
  },
  wow: { 
    icon: Sparkles,
    emoji: '😮',
    label: 'Wow',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    darkBgColor: 'dark:bg-yellow-950/40'
  },
  laugh: { 
    icon: Laugh,
    emoji: '😂',
    label: 'Laugh',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    darkBgColor: 'dark:bg-green-950/40'
  },
  idea: { 
    icon: Lightbulb,
    emoji: '💡',
    label: 'Great Idea',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-950/40'
  },
  rocket: { 
    icon: Rocket,
    emoji: '🚀',
    label: 'Amazing',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    darkBgColor: 'dark:bg-indigo-950/40'
  },
  clap: { 
    icon: HandMetal,
    emoji: '👏',
    label: 'Applause',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    darkBgColor: 'dark:bg-pink-950/40'
  }
} as const

interface ReactionWithUser extends Reaction {
  user: {
    name: string
    avatar: string
  }
}

interface ReactionListProps {
  reactions: ReactionWithUser[]
  loading?: boolean
  className?: string
  variant?: 'card' | 'modal' | 'compact'
  maxVisible?: number
}

export default function ReactionList({
  reactions,
  loading = false,
  className,
  variant = 'card',
  maxVisible = 5
}: ReactionListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedReactionType, setSelectedReactionType] = useState<ReactionType | 'all'>('all')

  // Group reactions by type
  const reactionsByType = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.type]) {
      acc[reaction.type] = []
    }
    acc[reaction.type].push(reaction)
    return acc
  }, {} as Record<ReactionType, ReactionWithUser[]>)

  // Get filtered reactions
  const filteredReactions = selectedReactionType === 'all' 
    ? reactions 
    : reactionsByType[selectedReactionType] || []

  // Get visible reactions
  const visibleReactions = isExpanded ? filteredReactions : filteredReactions.slice(0, maxVisible)
  const hasMore = filteredReactions.length > maxVisible

  // Get reaction counts
  const reactionCounts = Object.entries(reactionsByType).reduce((acc, [type, typeReactions]) => {
    acc[type as ReactionType] = typeReactions.length
    return acc
  }, {} as Record<ReactionType, number>)

  const totalReactions = reactions.length

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (totalReactions === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <div className="text-muted-foreground/50 mb-2">
          <Heart className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-sm text-muted-foreground">No reactions yet</p>
        <p className="text-xs text-muted-foreground/70">Be the first to react!</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with total count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
          </span>
        </div>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Reaction type filter */}
      {variant !== 'compact' && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedReactionType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedReactionType('all')}
            className="h-8 px-3 text-xs"
          >
            All ({totalReactions})
          </Button>
          {Object.entries(reactionCounts).map(([type, count]) => {
            const config = reactionConfig[type as ReactionType]
            return (
              <Button
                key={type}
                variant={selectedReactionType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedReactionType(type as ReactionType)}
                className="h-8 px-3 text-xs gap-1"
              >
                <span className="text-sm">{config.emoji}</span>
                {count}
              </Button>
            )
          })}
        </div>
      )}

      {/* Reactions list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleReactions.map((reaction, index) => {
            const config = reactionConfig[reaction.type]
            
            return (
              <motion.div
                key={reaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* User Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={reaction.user.avatar} />
                  <AvatarFallback className="text-sm font-semibold">
                    {reaction.user.name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground truncate">
                      {reaction.user.name}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs px-2 py-0.5",
                        config.bgColor,
                        config.darkBgColor,
                        config.color
                      )}
                    >
                      <span className="mr-1">{config.emoji}</span>
                      {config.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(reaction.createdAt, { addSuffix: true })}
                  </span>
                </div>

                {/* Reaction Icon */}
                <div className={cn(
                  "p-2 rounded-full",
                  config.bgColor,
                  config.darkBgColor
                )}>
                  <span className="text-lg">{config.emoji}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Show more/less button */}
        {hasMore && variant !== 'compact' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-9 text-sm font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show {filteredReactions.length - maxVisible} more
              </>
            )}
          </Button>
        )}
      </div>

      {/* Compact view for cards */}
      {variant === 'compact' && totalReactions > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <div className="flex -space-x-2">
            {reactions.slice(0, 4).map((reaction) => (
              <Avatar key={reaction.id} className="h-6 w-6 ring-2 ring-background">
                <AvatarImage src={reaction.user.avatar} />
                <AvatarFallback className="text-xs">
                  {reaction.user.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {totalReactions > 4 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{totalReactions - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
