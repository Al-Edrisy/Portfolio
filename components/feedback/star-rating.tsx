"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export const RATING_MOODS: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Needs improvement', emoji: '😕' },
  2: { label: 'Fair', emoji: '🙂' },
  3: { label: 'Good', emoji: '👍' },
  4: { label: 'Great!', emoji: '👏' },
  5: { label: 'Exceptional!', emoji: '🔥' }
}

interface StarRatingProps {
  maxStars?: number
  value: number
  onChange?: (rating: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  showMoodLabel?: boolean
}

export function StarRating({ 
  maxStars = 5, 
  value, 
  onChange, 
  className,
  size = 'md',
  readOnly = false,
  showMoodLabel = false
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  }

  const activeRating = hoverValue !== null ? hoverValue : value
  const currentMood = RATING_MOODS[activeRating]

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (readOnly || !onChange) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(maxStars, starValue + 1)
      onChange(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = Math.max(1, starValue - 1)
      onChange(prev)
    }
  }

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <div 
        className="flex items-center gap-1.5"
        role="radiogroup"
        aria-label={`Rating: ${value} of ${maxStars} stars`}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= activeRating
          const isInteractive = !readOnly && Boolean(onChange)

          const StarContent = (
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-150",
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"
                  : "fill-transparent text-muted-foreground/30 hover:text-amber-400/50"
              )}
            />
          )

          if (!isInteractive) {
            return (
              <span key={index} className="inline-block" aria-hidden="true">
                {StarContent}
              </span>
            )
          }

          return (
            <motion.button
              key={index}
              type="button"
              role="radio"
              aria-checked={starValue === value}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(null)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background transition-colors"
            >
              {StarContent}
            </motion.button>
          )
        })}
      </div>

      {showMoodLabel && currentMood && (
        <motion.div 
          key={activeRating}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
        >
          <span>{currentMood.emoji}</span>
          <span>{currentMood.label}</span>
        </motion.div>
      )}
    </div>
  )
}
