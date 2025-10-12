import type { CommentLength } from '@/types/ai'

/**
 * Configuration for comment length options
 */
export interface CommentLengthConfig {
  value: CommentLength
  label: string
  description: string
  wordRange: string
  charLimit: number
  icon: string
}

/**
 * Comment length configurations
 */
export const COMMENT_LENGTH_CONFIGS: Record<CommentLength, CommentLengthConfig> = {
  short: {
    value: 'short',
    label: 'Short',
    description: 'Quick reaction or feedback',
    wordRange: '10-20 words',
    charLimit: 150,
    icon: '⚡'
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced and thoughtful',
    wordRange: '20-30 words',
    charLimit: 250,
    icon: '💬'
  },
  long: {
    value: 'long',
    label: 'Long',
    description: 'Detailed and comprehensive',
    wordRange: '30-40 words',
    charLimit: 350,
    icon: '📝'
  }
}

export const COMMENT_LENGTH_OPTIONS = Object.values(COMMENT_LENGTH_CONFIGS)
export const DEFAULT_COMMENT_LENGTH: CommentLength = 'medium'

