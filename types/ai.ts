// AI-related type definitions

/**
 * Available comment tones for AI generation
 */
export type CommentTone = 
  | 'professional'
  | 'friendly'
  | 'funny'
  | 'technical'
  | 'enthusiastic'

/**
 * Available comment length options
 */
export type CommentLength = 
  | 'short'    // 10-20 words, quick reaction
  | 'medium'   // 20-30 words, balanced
  | 'long'     // 30-40 words, detailed

/**
 * Available AI models for comment generation
 * All are FAST models (no thinking/reasoning delay)
 */
export type AIModel = 
  | 'meta-llama/llama-3.3-8b-instruct:free'
  | 'mistralai/mistral-7b-instruct:free'
  | 'google/gemini-2.0-flash-exp:free'
  | 'google/gemma-3-12b-it:free'
  | 'nvidia/nemotron-nano-9b-v2:free'
  | 'mistralai/mistral-small-24b-instruct-2501:free'
  | 'deepseek/deepseek-chat'
  | 'qwen/qwen3-14b:free'

/**
 * Configuration for AI model
 */
export interface AIModelConfig {
  value: AIModel
  label: string
  provider: string
  description: string
  icon: string
  recommended?: boolean
}

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
 * Configuration for comment tone behavior
 */
export interface CommentToneConfig {
  tone: CommentTone
  label: string
  description: string
  icon: string
  prompt: string
}

/**
 * Request payload for AI comment generation
 */
export interface AICommentGenerateRequest {
  projectDescription: string
  projectTitle: string
  tone: CommentTone
  userId: string
  length?: CommentLength
  customInstructions?: string
  model?: AIModel
  maxLength?: number // Deprecated: use length instead
}

/**
 * Response from AI comment generation
 */
export interface AICommentGenerateResponse {
  success: boolean
  comment?: string
  error?: string
  tokensUsed?: number
  model?: string
}

/**
 * Rate limit tracking for AI generation
 */
export interface AIRateLimitInfo {
  requestsRemaining: number
  resetTime: number
  totalRequests: number
  maxRequests: number
}

/**
 * AI generation error types
 */
export type AIGenerationError = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_INPUT'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'CONTENT_FILTER'
  | 'UNKNOWN_ERROR'

/**
 * AI generation error response
 */
export interface AIGenerationErrorResponse {
  error: AIGenerationError
  message: string
  details?: string
  retryAfter?: number
}

