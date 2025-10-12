import { CommentTone, CommentToneConfig } from '@/types/ai'

/**
 * Configuration for different comment tones
 * Each tone has specific prompting to guide AI behavior
 */
export const COMMENT_TONE_CONFIGS: Record<CommentTone, CommentToneConfig> = {
  professional: {
    tone: 'professional',
    label: 'Professional',
    description: 'Formal and business-appropriate',
    icon: '💼',
    prompt: 'Write a professional, formal comment that provides constructive feedback. Use business-appropriate language and focus on specific aspects of the project. Be respectful and objective.'
  },
  friendly: {
    tone: 'friendly',
    label: 'Friendly',
    description: 'Warm and approachable',
    icon: '😊',
    prompt: 'Write a friendly, warm comment that shows genuine interest and support. Use casual but respectful language. Be encouraging and personable while maintaining appropriate boundaries.'
  },
  funny: {
    tone: 'funny',
    label: 'Funny',
    description: 'Humorous and lighthearted',
    icon: '😄',
    prompt: 'Write a lighthearted, humorous comment that makes a joke or uses wit while still being relevant to the project. Keep it fun but not offensive. Balance humor with meaningful feedback.'
  },
  technical: {
    tone: 'technical',
    label: 'Technical',
    description: 'Detailed and analytical',
    icon: '🔧',
    prompt: 'Write a technical, analytical comment that focuses on implementation details, architecture, or technical choices. Use appropriate technical terminology and provide specific technical insights or questions.'
  },
  enthusiastic: {
    tone: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Excited and energetic',
    icon: '🚀',
    prompt: 'Write an enthusiastic, excited comment that shows genuine excitement and energy about the project. Use exclamation points appropriately and express authentic passion for the work shown.'
  }
}

/**
 * Get ordered list of comment tones for UI display
 */
export const COMMENT_TONE_OPTIONS: CommentTone[] = [
  'professional',
  'friendly',
  'funny',
  'technical',
  'enthusiastic'
]

/**
 * Default tone for AI comment generation
 */
export const DEFAULT_COMMENT_TONE: CommentTone = 'friendly'

/**
 * Maximum comment length in characters
 */
export const MAX_COMMENT_LENGTH = 500

/**
 * Minimum project description length for AI generation
 */
export const MIN_DESCRIPTION_LENGTH = 10

