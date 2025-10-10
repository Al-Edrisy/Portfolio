"use client"

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  maxStars?: number
  value: number
  onChange: (rating: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ 
  maxStars = 6, 
  value, 
  onChange, 
  className,
  size = 'md'
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1
        const isFilled = hoverValue !== null ? starValue <= hoverValue : starValue <= value

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

